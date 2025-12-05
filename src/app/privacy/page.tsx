"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
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
            <Shield className="text-[#667eea]" size={32} />
            <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          </div>

          <p className="text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                Harmonic Wave Studio ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-medium text-white mb-3 mt-6">Personal Information</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                When you create an account, we may collect:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Email address</li>
                <li>Display name</li>
                <li>Profile picture (if provided through authentication provider)</li>
                <li>Authentication provider information (Google, GitHub)</li>
              </ul>

              <h3 className="text-xl font-medium text-white mb-3 mt-6">Usage Information</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                We automatically collect certain information when you use our service:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Device and browser information</li>
                <li>IP address</li>
                <li>Pages visited and features used</li>
                <li>Time and date of visits</li>
              </ul>

              <h3 className="text-xl font-medium text-white mb-3 mt-6">User Content</h3>
              <p className="text-gray-300 leading-relaxed">
                We store projects and visualizations you create, including saved configurations, shared projects, and gallery submissions.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use the collected information to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide and maintain our service</li>
                <li>Process your subscription and payments</li>
                <li>Send you important updates about the service</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Improve our service and develop new features</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Third parties that help us operate our service (e.g., Paddle for payments, Firebase for authentication and storage)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Services</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Our service uses the following third-party services:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>Firebase:</strong> Authentication and data storage</li>
                <li><strong>Paddle:</strong> Payment processing</li>
                <li><strong>Google Analytics:</strong> Usage analytics</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                These services have their own privacy policies governing how they handle your data.
              </p>
            </section>

            {/* Data Security */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
              <p className="text-gray-300 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your account and associated data at any time.
              </p>
            </section>

            {/* Your Rights */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
                <li>Withdraw consent where applicable</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                To exercise these rights, please contact us at support@harmonicwave.app.
              </p>
            </section>

            {/* Cookies */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Cookies and Tracking</h2>
              <p className="text-gray-300 leading-relaxed">
                We use cookies and similar technologies to maintain your session, remember your preferences, and analyze how our service is used. You can control cookie settings through your browser, but disabling cookies may affect functionality.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
              </p>
            </section>

            {/* International Transfers */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">11. International Data Transfers</h2>
              <p className="text-gray-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{" "}
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
              <span className="text-xl">🌊</span>
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
