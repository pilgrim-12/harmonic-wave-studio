import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import { PADDLE_WEBHOOK_SECRET, PADDLE_PRICES } from "@/lib/paddle/config";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Paddle Webhook Handler
 *
 * Handles subscription lifecycle events from Paddle:
 * - subscription.created / subscription.activated
 * - subscription.updated
 * - subscription.canceled
 * - subscription.paused / subscription.resumed
 * - transaction.completed (for one-time or initial subscription payment)
 *
 * Webhook setup in Paddle dashboard:
 * URL: https://your-domain.com/api/paddle/webhooks
 * Events: subscription.*, transaction.completed
 */

// Paddle webhook event types we care about
type PaddleEventType =
  | "subscription.created"
  | "subscription.activated"
  | "subscription.updated"
  | "subscription.canceled"
  | "subscription.paused"
  | "subscription.resumed"
  | "transaction.completed";

interface PaddleWebhookEvent {
  event_type: PaddleEventType;
  event_id: string;
  occurred_at: string;
  data: PaddleSubscriptionData | PaddleTransactionData;
}

interface PaddleSubscriptionData {
  id: string; // subscription ID
  status: "active" | "canceled" | "past_due" | "paused" | "trialing";
  customer_id: string;
  custom_data?: {
    user_id?: string;
  };
  items: Array<{
    price: {
      id: string;
    };
  }>;
  current_billing_period?: {
    starts_at: string;
    ends_at: string;
  };
  scheduled_change?: {
    action: "cancel" | "pause" | "resume";
    effective_at: string;
  } | null;
  canceled_at?: string;
}

interface PaddleTransactionData {
  id: string; // transaction ID
  status: "completed" | "billed" | "canceled";
  customer_id: string;
  subscription_id?: string;
  custom_data?: {
    user_id?: string;
  };
  items: Array<{
    price: {
      id: string;
    };
  }>;
}

/**
 * Verify Paddle webhook signature
 * https://developer.paddle.com/webhooks/signature-verification
 */
function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature || !PADDLE_WEBHOOK_SECRET) {
    console.error("Missing signature or webhook secret");
    return false;
  }

  // Paddle signature format: ts=timestamp;h1=hash
  const parts = signature.split(";");
  const tsMatch = parts.find((p) => p.startsWith("ts="));
  const h1Match = parts.find((p) => p.startsWith("h1="));

  if (!tsMatch || !h1Match) {
    console.error("Invalid signature format");
    return false;
  }

  const timestamp = tsMatch.replace("ts=", "");
  const receivedHash = h1Match.replace("h1=", "");

  // Build signed payload: timestamp:rawBody
  const signedPayload = `${timestamp}:${rawBody}`;

  // Calculate expected hash
  const expectedHash = crypto
    .createHmac("sha256", PADDLE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex");

  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(receivedHash),
    Buffer.from(expectedHash)
  );
}

/**
 * Determine plan type from price ID
 */
function getPlanFromPriceId(priceId: string): "monthly" | "yearly" {
  if (priceId === PADDLE_PRICES.pro_yearly) {
    return "yearly";
  }
  return "monthly";
}

/**
 * Handle subscription events
 */
async function handleSubscriptionEvent(
  eventType: PaddleEventType,
  data: PaddleSubscriptionData
) {
  const userId = data.custom_data?.user_id;

  if (!userId) {
    console.error("No user_id in custom_data for subscription:", data.id);
    return { success: false, error: "Missing user_id" };
  }

  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);

  const priceId = data.items?.[0]?.price?.id;
  const plan = priceId ? getPlanFromPriceId(priceId) : "monthly";

  switch (eventType) {
    case "subscription.created":
    case "subscription.activated": {
      // User subscribed - upgrade to Pro
      await userRef.set(
        {
          tier: "pro",
          subscription: {
            plan,
            status: "active",
            paddleCustomerId: data.customer_id,
            paddleSubscriptionId: data.id,
            startDate: data.current_billing_period?.starts_at
              ? new Date(data.current_billing_period.starts_at)
              : FieldValue.serverTimestamp(),
            endDate: data.current_billing_period?.ends_at
              ? new Date(data.current_billing_period.ends_at)
              : null,
          },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`✅ User ${userId} upgraded to Pro (${plan})`);
      break;
    }

    case "subscription.updated": {
      // Subscription updated (plan change, renewal, etc.)
      const updateData: Record<string, unknown> = {
        "subscription.plan": plan,
        "subscription.status": data.status === "active" ? "active" : data.status,
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (data.current_billing_period) {
        updateData["subscription.startDate"] = new Date(
          data.current_billing_period.starts_at
        );
        updateData["subscription.endDate"] = new Date(
          data.current_billing_period.ends_at
        );
      }

      // Handle scheduled cancellation
      if (data.scheduled_change?.action === "cancel") {
        updateData["subscription.scheduledToBeCancelledAt"] = new Date(
          data.scheduled_change.effective_at
        );
      } else {
        updateData["subscription.scheduledToBeCancelledAt"] =
          FieldValue.delete();
      }

      await userRef.update(updateData);
      console.log(`✅ User ${userId} subscription updated`);
      break;
    }

    case "subscription.canceled": {
      // Subscription cancelled - downgrade to free
      await userRef.set(
        {
          tier: "free",
          subscription: {
            status: "cancelled",
            cancelledAt: data.canceled_at
              ? new Date(data.canceled_at)
              : FieldValue.serverTimestamp(),
          },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`⚠️ User ${userId} subscription cancelled, downgraded to free`);
      break;
    }

    case "subscription.paused": {
      await userRef.update({
        tier: "free",
        "subscription.status": "paused",
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`⏸️ User ${userId} subscription paused`);
      break;
    }

    case "subscription.resumed": {
      await userRef.update({
        tier: "pro",
        "subscription.status": "active",
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`▶️ User ${userId} subscription resumed`);
      break;
    }
  }

  return { success: true };
}

/**
 * Handle transaction completed event (backup for subscription activation)
 */
async function handleTransactionCompleted(data: PaddleTransactionData) {
  const userId = data.custom_data?.user_id;

  if (!userId) {
    console.error("No user_id in custom_data for transaction:", data.id);
    return { success: false, error: "Missing user_id" };
  }

  // Only process completed subscription transactions
  if (!data.subscription_id) {
    console.log("Transaction without subscription, skipping:", data.id);
    return { success: true };
  }

  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);

  const priceId = data.items?.[0]?.price?.id;
  const plan = priceId ? getPlanFromPriceId(priceId) : "monthly";

  await userRef.set(
    {
      tier: "pro",
      subscription: {
        plan,
        status: "active",
        paddleCustomerId: data.customer_id,
        paddleSubscriptionId: data.subscription_id,
        paddleTransactionId: data.id,
        startDate: FieldValue.serverTimestamp(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`✅ User ${userId} upgraded to Pro via transaction ${data.id}`);
  return { success: true };
}

/**
 * POST /api/paddle/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("paddle-signature");

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event: PaddleWebhookEvent = JSON.parse(rawBody);
    console.log(`📩 Paddle webhook: ${event.event_type}`, event.event_id);

    // Route to appropriate handler
    switch (event.event_type) {
      case "subscription.created":
      case "subscription.activated":
      case "subscription.updated":
      case "subscription.canceled":
      case "subscription.paused":
      case "subscription.resumed":
        await handleSubscriptionEvent(
          event.event_type,
          event.data as PaddleSubscriptionData
        );
        break;

      case "transaction.completed":
        await handleTransactionCompleted(event.data as PaddleTransactionData);
        break;

      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 to prevent retries for parsing errors
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/paddle/webhooks
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    configured: Boolean(PADDLE_WEBHOOK_SECRET),
  });
}
