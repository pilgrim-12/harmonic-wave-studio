"use client";

import Link from "next/link";
import { Waves, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Waves className="text-[#667eea]" size={28} />
            <span className="text-xl font-bold text-white">
              Harmonic Wave Studio
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-300 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link href="/studio">
              <Button size="sm">Launch Studio</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <RefreshCcw className="text-[#667eea]" size={32} />
            <h1 className="text-4xl font-bold text-white">Refund Policy</h1>
          </div>

          <p className="text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
              <p className="text-gray-300 leading-relaxed">
                At Harmonic Wave Studio, we want you to be completely satisfied with your purchase. This Refund Policy outlines the terms and conditions for refunds on our subscription plans.
              </p>
            </section>

            {/* Free Trial */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Free Tier</h2>
              <p className="text-gray-300 leading-relaxed">
                Harmonic Wave Studio offers a free tier with basic features. We encourage you to fully explore the free version before upgrading to a paid plan. This allows you to evaluate the service without any financial commitment.
              </p>
            </section>

            {/* Refund Eligibility */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Refund Eligibility</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We offer refunds under the following conditions:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>14-Day Money-Back Guarantee:</strong> If you are not satisfied with your Pro subscription, you may request a full refund within 14 days of your initial purchase.</li>
                <li><strong>Technical Issues:</strong> If you experience persistent technical issues that prevent you from using the service and our support team cannot resolve them, you may be eligible for a refund.</li>
                <li><strong>Accidental Purchases:</strong> If you accidentally subscribed or were charged in error, please contact us immediately for a refund.</li>
              </ul>
            </section>

            {/* Non-Refundable */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Non-Refundable Situations</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Refunds are generally not provided in the following cases:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Requests made after the 14-day refund period</li>
                <li>Change of mind after the refund period has expired</li>
                <li>Failure to cancel before an automatic renewal</li>
                <li>Violation of our Terms of Service</li>
                <li>Partial refunds for unused portions of a subscription period (except as required by law)</li>
              </ul>
            </section>

            {/* Subscription Cancellation */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription Cancellation</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You can cancel your subscription at any time:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Go to your Profile page and click "Manage Subscription"</li>
                <li>Your subscription will remain active until the end of the current billing period</li>
                <li>After cancellation, you will retain access to Pro features until your subscription expires</li>
                <li>Cancellation does not automatically trigger a refund</li>
              </ul>
            </section>

            {/* How to Request */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">5. How to Request a Refund</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                To request a refund:
              </p>
              <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
                <li>Email us at <a href="mailto:support@harmonicwave.app" className="text-[#667eea] hover:underline">support@harmonicwave.app</a></li>
                <li>Include your account email address</li>
                <li>Provide the reason for your refund request</li>
                <li>Include any relevant transaction or order details</li>
              </ol>
              <p className="text-gray-300 leading-relaxed mt-4">
                We will review your request and respond within 3-5 business days.
              </p>
            </section>

            {/* Processing Time */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Refund Processing</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Once approved:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Refunds are processed through our payment provider, Paddle</li>
                <li>The refund will be credited to your original payment method</li>
                <li>Processing typically takes 5-10 business days, depending on your payment provider</li>
                <li>You will receive an email confirmation when the refund is processed</li>
              </ul>
            </section>

            {/* Currency */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Currency and Fees</h2>
              <p className="text-gray-300 leading-relaxed">
                Refunds are issued in the same currency as the original transaction. We do not deduct any fees from refunds. However, your bank or payment provider may apply currency conversion fees that are beyond our control.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of our service after changes constitutes acceptance of the new policy.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about our Refund Policy, please contact us at{" "}
                <a href="mailto:support@harmonicwave.app" className="text-[#667eea] hover:underline">
                  support@harmonicwave.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Waves className="text-[#667eea]" size={24} />
              <span className="font-bold text-white">Harmonic Wave Studio</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/refund" className="hover:text-white transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Harmonic Wave Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
