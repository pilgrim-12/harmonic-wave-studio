/**
 * Paddle Configuration
 *
 * For testing, use Sandbox environment:
 * - Create account at https://sandbox-vendors.paddle.com
 * - Get your Client Token from Sandbox dashboard
 * - Create a product and price in Sandbox
 *
 * For webhooks:
 * - Set up webhook endpoint in Paddle dashboard: /api/paddle/webhooks
 * - Copy the webhook secret to PADDLE_WEBHOOK_SECRET
 */

// Determine if we're in sandbox mode
export const PADDLE_ENVIRONMENT = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
  ? 'production'
  : 'sandbox';

// Client-side token (safe to expose)
export const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';

// Server-side webhook secret (NEVER expose to client)
export const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || '';

// Price IDs from Paddle dashboard
export const PADDLE_PRICES = {
  pro_monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY || '',
  pro_yearly: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_YEARLY || '',
};

// Validate client configuration
export function isPaddleConfigured(): boolean {
  return Boolean(PADDLE_CLIENT_TOKEN && (PADDLE_PRICES.pro_monthly || PADDLE_PRICES.pro_yearly));
}

// Validate webhook configuration (server-side only)
export function isWebhookConfigured(): boolean {
  return Boolean(PADDLE_WEBHOOK_SECRET);
}

// Helper to get the correct price ID
export function getPriceId(period: 'monthly' | 'yearly'): string {
  return period === 'monthly' ? PADDLE_PRICES.pro_monthly : PADDLE_PRICES.pro_yearly;
}
