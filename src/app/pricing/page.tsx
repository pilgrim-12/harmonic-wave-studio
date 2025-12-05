"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Waves,
  Check,
  X,
  Zap,
  Crown,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TIER_CONFIG } from "@/config/tiers";
import { useAuth } from "@/contexts/AuthContext";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const { user } = useAuth();

  const anonymous = TIER_CONFIG.anonymous;
  const free = TIER_CONFIG.free;
  const pro = TIER_CONFIG.pro;

  const proPrice = billingPeriod === "monthly" ? pro.metadata.price : (pro.metadata.yearlyPrice || 48) / 12;
  const savings = billingPeriod === "yearly" ? Math.round((1 - (pro.metadata.yearlyPrice || 48) / (pro.metadata.price * 12)) * 100) : 0;

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
              className="text-white font-semibold"
            >
              Pricing
            </Link>
            <Link href="/studio">
              <Button size="sm">Launch Studio</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
            <span className="text-purple-400 text-sm font-semibold flex items-center gap-2">
              <Sparkles size={16} />
              Simple, transparent pricing
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Start free and upgrade when you need more power. No hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${billingPeriod === "monthly" ? "text-white" : "text-gray-400"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingPeriod === "yearly" ? "bg-[#667eea]" : "bg-gray-700"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  billingPeriod === "yearly" ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm ${billingPeriod === "yearly" ? "text-white" : "text-gray-400"}`}>
              Yearly
            </span>
            {billingPeriod === "yearly" && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                Save {savings}%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Guest Tier */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-700/30 flex items-center justify-center">
                  <User size={24} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{anonymous.metadata.displayName}</h3>
                  <p className="text-sm text-gray-400">{anonymous.metadata.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-400">/forever</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {anonymous.metadata.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                    <Check size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
                <li className="flex items-start gap-3 text-gray-500 text-sm">
                  <X size={18} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  Save projects
                </li>
                <li className="flex items-start gap-3 text-gray-500 text-sm">
                  <X size={18} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  Export images
                </li>
              </ul>

              <Link href="/studio">
                <Button variant="secondary" className="w-full">
                  Try Now
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            {/* Free Tier */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Zap size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{free.metadata.displayName}</h3>
                  <p className="text-sm text-gray-400">{free.metadata.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-400">/forever</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {free.metadata.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                    <Check size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
                <li className="flex items-start gap-3 text-gray-500 text-sm">
                  <X size={18} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  FFT Analysis
                </li>
                <li className="flex items-start gap-3 text-gray-500 text-sm">
                  <X size={18} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  Digital Filters
                </li>
              </ul>

              {user ? (
                <Button variant="secondary" className="w-full" disabled>
                  <Check size={16} />
                  Current Plan
                </Button>
              ) : (
                <Link href="/studio">
                  <Button variant="secondary" className="w-full">
                    Sign Up Free
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              )}
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-b from-[#667eea]/20 to-[#1a1a1a] rounded-2xl border-2 border-[#667eea] p-8 flex flex-col relative">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#667eea] text-white text-sm font-semibold rounded-full">
                Most Popular
              </div>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="w-12 h-12 rounded-xl bg-[#667eea]/30 flex items-center justify-center">
                  <Crown size={24} className="text-[#667eea]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{pro.metadata.displayName}</h3>
                  <p className="text-sm text-gray-400">{pro.metadata.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${proPrice.toFixed(0)}</span>
                <span className="text-gray-400">/month</span>
                {billingPeriod === "yearly" && (
                  <span className="ml-2 text-sm text-gray-500 line-through">${pro.metadata.price}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {pro.metadata.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                    <Check size={18} className="text-[#667eea] flex-shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Button className="w-full bg-[#667eea] hover:bg-[#5a6fd6]">
                Upgrade to Pro
                <ArrowRight size={16} />
              </Button>

              {billingPeriod === "yearly" && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  Billed ${pro.metadata.yearlyPrice} yearly
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 px-4 bg-[#0f0f0f]">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Compare Features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Guest</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Free</th>
                  <th className="text-center py-4 px-4 text-[#667eea] font-medium">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <FeatureRow feature="Radii" guest="3" free="5" pro="Unlimited" />
                <FeatureRow feature="Projects" guest="0" free="3" pro="Unlimited" />
                <FeatureRow feature="Gallery Shares" guest="0" free="1" pro="Unlimited" />
                <FeatureRow feature="Trail Points" guest="500" free="1000" pro="4000" />
                <FeatureRow feature="Sample Rate" guest="500 Hz" free="500 Hz" pro="2000 Hz" />
                <FeatureRow feature="Presets" guest={true} free={true} pro={true} />
                <FeatureRow feature="PNG Export" guest={false} free={true} pro={true} />
                <FeatureRow feature="JSON Export" guest={false} free={true} pro={true} />
                <FeatureRow feature="CSV Export" guest={false} free={false} pro={true} />
                <FeatureRow feature="4K Export" guest={false} free={false} pro={true} />
                <FeatureRow feature="GIF Export" guest={false} free={false} pro={true} />
                <FeatureRow feature="Noise Simulation" guest={false} free={true} pro={true} />
                <FeatureRow feature="Digital Filters" guest={false} free={false} pro={true} />
                <FeatureRow feature="FFT Analysis" guest={false} free={false} pro={true} />
                <FeatureRow feature="Audio Generation" guest={false} free={false} pro={true} />
                <FeatureRow feature="Priority Support" guest={false} free={false} pro={true} />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <FAQItem
              question="Can I cancel my subscription anytime?"
              answer="Yes, you can cancel your Pro subscription at any time. You'll retain access to Pro features until the end of your billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, PayPal, and other payment methods through our payment provider Paddle."
            />
            <FAQItem
              question="Is there a refund policy?"
              answer="Yes, we offer a 14-day money-back guarantee. If you're not satisfied with Pro, contact us within 14 days of purchase for a full refund."
            />
            <FAQItem
              question="Do I need to pay to use the app?"
              answer="No! The Free tier gives you access to core features including saving projects, exporting images, and sharing to the gallery. Pro unlocks advanced features like FFT analysis and digital filters."
            />
            <FAQItem
              question="Can I upgrade or downgrade later?"
              answer="Absolutely. You can upgrade to Pro anytime, and if you cancel, you'll be downgraded to Free at the end of your billing period."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Join thousands of users creating beautiful harmonic visualizations.
            </p>
            <Link href="/studio">
              <Button
                size="lg"
                className="bg-white text-[#667eea] hover:bg-gray-100"
              >
                Launch Studio
                <ArrowRight size={20} />
              </Button>
            </Link>
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

function FeatureRow({
  feature,
  guest,
  free,
  pro,
}: {
  feature: string;
  guest: string | boolean;
  free: string | boolean;
  pro: string | boolean;
}) {
  const renderValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check size={18} className="text-green-400 mx-auto" />
      ) : (
        <X size={18} className="text-gray-600 mx-auto" />
      );
    }
    return <span className="text-gray-300">{value}</span>;
  };

  return (
    <tr>
      <td className="py-4 px-4 text-gray-300">{feature}</td>
      <td className="py-4 px-4 text-center">{renderValue(guest)}</td>
      <td className="py-4 px-4 text-center">{renderValue(free)}</td>
      <td className="py-4 px-4 text-center">{renderValue(pro)}</td>
    </tr>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-2">{question}</h3>
      <p className="text-gray-400">{answer}</p>
    </div>
  );
}
