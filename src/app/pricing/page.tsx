"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Pricing page redirect
 * Since we moved to a free + donations model, redirect to /support
 */
export default function PricingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/support");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <p className="text-gray-400">Redirecting to support page...</p>
    </div>
  );
}
