import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK for server-side operations
 * Used by API routes (webhooks, etc.)
 *
 * Required environment variables:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY (base64 encoded or raw with \n)
 */

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
    );
  }

  // Handle private key - it may be base64 encoded or have escaped newlines
  let privateKey = privateKeyRaw;

  // If base64 encoded, decode it
  if (!privateKeyRaw.includes("-----BEGIN")) {
    privateKey = Buffer.from(privateKeyRaw, "base64").toString("utf-8");
  }

  // Replace escaped newlines with actual newlines
  privateKey = privateKey.replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

// Lazy initialization
let adminDb: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (!adminDb) {
    const app = getAdminApp();
    adminDb = getFirestore(app);
  }
  return adminDb;
}
