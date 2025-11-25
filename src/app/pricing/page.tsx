"use client";

import React from "react";
import Link from "next/link";
import { Check, Crown, Zap, ArrowLeft } from "lucide-react";
import { getAllTiers, UserTier } from "@/config/tiers";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export default function PricingPage() {
  const { user, signInWithGoogle, userProfile } = useAuth();
  const currentTier: UserTier = user
    ? (userProfile?.tier as UserTier) || "free"
    : "anonymous";

  const tiers = getAllTiers();

  const handleSelectPlan = async (tierName: string) => {
    if (tierName === "anonymous") {
      // Do nothing, it's just to show comparison
      return;
    }

    if (tierName === "free") {
      if (!user) {
        // Sign in
        try {
          await signInWithGoogle();
        } catch (error) {
          console.error("Sign in error:", error);
          alert("Failed to sign in. Please try again.");
        }
      } else {
        // Already Free, go to studio
        window.location.href = "/studio";
      }
      return;
    }

    if (tierName === "pro") {
      // TODO: Redirect to Stripe checkout
      alert("🚧 Stripe checkout coming soon!\n\nFor now, contact us at support@harmonicstudio.com");
      return;
    }
  };

  const getPlanButtonText = (tierName: string) => {
    if (tierName === "anonymous") return "Try Now";
    if (tierName === currentTier) return "Current Plan";
    if (tierName === "free") return user ? "Active" : "Sign In Free";
    if (tierName === "pro") return "Upgrade to Pro";
    return "Select Plan";
  };

  const isPlanActive = (tierName: string) => {
    return tierName === currentTier;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link href="/studio">
          <Button variant="secondary" className="mb-8">
            <ArrowLeft size={16} className="mr-2" />
            Back to Studio
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free and upgrade anytime. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier) => {
            const isPopular = tier.metadata.popular;
            const isCurrent = isPlanActive(tier.metadata.name);

            return (
              <div
                key={tier.metadata.name}
                className={`relative bg-[#1a1a1a] rounded-2xl border-2 p-8 flex flex-col ${
                  isPopular
                    ? "border-yellow-500 shadow-xl shadow-yellow-500/20"
                    : "border-[#2a2a2a]"
                } ${isCurrent ? "ring-2 ring-blue-500" : ""}`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrent && (
                  <div className="absolute -top-4 right-4 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                    CURRENT
                  </div>
                )}

                {/* Icon */}
                <div className="mb-4">
                  {tier.metadata.name === "pro" ? (
                    <Crown size={40} className="text-yellow-500" />
                  ) : (
                    <Zap
                      size={40}
                      style={{ color: tier.metadata.color }}
                    />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tier.metadata.displayName}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-6 min-h-[40px]">
                  {tier.metadata.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  {tier.metadata.price === 0 ? (
                    <div className="text-4xl font-bold text-white">Free</div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">
                          ${tier.metadata.price}
                        </span>
                        <span className="text-gray-400">/month</span>
                      </div>
                      {tier.metadata.yearlyPrice && (
                        <p className="text-sm text-gray-500 mt-1">
                          or ${tier.metadata.yearlyPrice}/year
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPlan(tier.metadata.name)}
                  disabled={isCurrent}
                  variant={isPopular ? "primary" : "secondary"}
                  className={`w-full mb-6 ${
                    isPopular
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                      : ""
                  }`}
                >
                  {getPlanButtonText(tier.metadata.name)}
                </Button>

                {/* Features */}
                <div className="space-y-3 flex-1">
                  {tier.metadata.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check
                        size={18}
                        className={`flex-shrink-0 mt-0.5 ${
                          isPopular ? "text-yellow-400" : "text-green-400"
                        }`}
                      />
                      <span className="text-gray-300 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <details className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                Can I upgrade or downgrade anytime?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-gray-400 mt-3">
                Yes! You can upgrade to Pro anytime. If you downgrade, your Pro features will remain active until the end of your billing period.
              </p>
            </details>

            <details className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                What payment methods do you accept?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-gray-400 mt-3">
                We accept all major credit cards (Visa, Mastercard, American Express) through Stripe. Your payment information is never stored on our servers.
              </p>
            </details>

            <details className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                Is there a free trial for Pro?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-gray-400 mt-3">
                The Free plan is generous enough to try most features! For Pro-specific features, we offer a 30-day money-back guarantee - no questions asked.
              </p>
            </details>

            <details className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                What happens to my projects if I downgrade?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-gray-400 mt-3">
                Your projects are always safe! If you downgrade from Pro to Free, you'll keep access to all your projects, but won't be able to create new ones beyond the Free plan limit (3 projects).
              </p>
            </details>

            <details className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                Do you offer student or educational discounts?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-gray-400 mt-3">
                Yes! We offer 50% off Pro plans for students and educators. Contact us at education@harmonicstudio.com with proof of enrollment or employment.
              </p>
            </details>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            Need a custom plan or have questions?
          </p>
          <a
            href="mailto:support@harmonicstudio.com"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Contact us
          </a>
        </div>
      </div>
    </div>
  );
}
