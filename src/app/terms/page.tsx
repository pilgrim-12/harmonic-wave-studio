"use client";

import Link from "next/link";
import { Waves, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TermsPage() {
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
            <FileText className="text-[#667eea]" size={32} />
            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          </div>

          <p className="text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to Harmonic Wave Studio. By accessing or using our service, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                By creating an account or using Harmonic Wave Studio, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <p className="text-gray-300 leading-relaxed">
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            {/* Description of Service */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Description of Service</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Harmonic Wave Studio is an interactive web application for visualizing Fourier series and harmonic waves. Our service includes:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Real-time epicycle and waveform visualization</li>
                <li>Signal processing tools including FFT analysis and digital filters</li>
                <li>Project creation, saving, and sharing capabilities</li>
                <li>Export functionality for images and data</li>
                <li>Community gallery for sharing creations</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">4. User Accounts</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                To access certain features, you may need to create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>
            </section>

            {/* Subscription and Payments */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Subscription and Payments</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Harmonic Wave Studio offers both free and paid subscription plans. By subscribing to a paid plan:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>You authorize us to charge your payment method on a recurring basis</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>Refunds are handled according to our refund policy</li>
                <li>Prices may change with reasonable notice</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Payments are processed securely through Paddle, our payment provider. Your payment information is handled according to Paddle's terms and privacy policy.
              </p>
            </section>

            {/* Acceptable Use */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Acceptable Use</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Use the service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Upload malicious content or code</li>
                <li>Violate the intellectual property rights of others</li>
                <li>Share content that is offensive, harmful, or inappropriate</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                The Harmonic Wave Studio service, including its original content, features, and functionality, is owned by us and is protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Content you create using our service remains your property. By sharing content publicly, you grant us a license to display it in our gallery and promotional materials.
              </p>
            </section>

            {/* Disclaimer of Warranties */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-gray-300 leading-relaxed">
                The service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free. Use of the service is at your own risk.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            {/* Termination */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
              <p className="text-gray-300 leading-relaxed">
                We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. You may also terminate your account at any time through your account settings.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{" "}
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
              <Link href="/about" className="hover:text-white transition-colors">
                About
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
