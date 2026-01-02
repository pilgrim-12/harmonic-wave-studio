import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { PADDLE_ENVIRONMENT } from "@/lib/paddle/config";

/**
 * GET /api/paddle/portal
 *
 * Creates a Customer Portal session URL for the authenticated user.
 * Uses Paddle API to get subscription management URLs.
 */

const PADDLE_API_BASE = PADDLE_ENVIRONMENT === 'production'
  ? 'https://api.paddle.com'
  : 'https://sandbox-api.paddle.com';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params (passed from client)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Get user's subscription info from Firestore
    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const subscriptionId = userData?.subscription?.paddleSubscriptionId;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Get Paddle API key from environment
    const paddleApiKey = process.env.PADDLE_API_KEY;
    if (!paddleApiKey) {
      console.error("PADDLE_API_KEY not configured");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    // Fetch subscription from Paddle to get management URLs
    const response = await fetch(
      `${PADDLE_API_BASE}/subscriptions/${subscriptionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paddleApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error("Paddle API error:", response.status, await response.text());
      return NextResponse.json(
        { error: "Failed to fetch subscription" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const managementUrls = data.data?.management_urls;

    if (!managementUrls) {
      // Fallback: Create customer portal session
      const portalResponse = await fetch(
        `${PADDLE_API_BASE}/customers/${userData.subscription.paddleCustomerId}/portal-sessions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paddleApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription_ids: [subscriptionId],
          }),
        }
      );

      if (portalResponse.ok) {
        const portalData = await portalResponse.json();
        return NextResponse.json({
          url: portalData.data?.urls?.general,
          cancelUrl: null,
          updatePaymentUrl: null,
        });
      }

      return NextResponse.json(
        { error: "Could not generate portal URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: managementUrls.cancel, // General portal URL
      cancelUrl: managementUrls.cancel,
      updatePaymentUrl: managementUrls.update_payment_method,
    });
  } catch (error) {
    console.error("Portal API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
