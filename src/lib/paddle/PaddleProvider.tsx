"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { initializePaddle, Paddle, Environments } from "@paddle/paddle-js";
import { PADDLE_CLIENT_TOKEN, PADDLE_ENVIRONMENT, isPaddleConfigured, getPriceId } from "./config";
import { useAuth } from "@/contexts/AuthContext";

interface PaddleContextType {
  paddle: Paddle | null;
  isLoading: boolean;
  isConfigured: boolean;
  openCheckout: (period: "monthly" | "yearly") => void;
  error: string | null;
}

const PaddleContext = createContext<PaddleContextType>({
  paddle: null,
  isLoading: true,
  isConfigured: false,
  openCheckout: () => {},
  error: null,
});

export function usePaddle() {
  return useContext(PaddleContext);
}

interface PaddleProviderProps {
  children: React.ReactNode;
}

export function PaddleProvider({ children }: PaddleProviderProps) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isConfigured = isPaddleConfigured();

  useEffect(() => {
    if (!isConfigured) {
      console.warn("⚠️ Paddle not configured. Set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN in .env.local");
      setIsLoading(false);
      return;
    }

    initializePaddle({
      environment: PADDLE_ENVIRONMENT as Environments,
      token: PADDLE_CLIENT_TOKEN,
      eventCallback: (event) => {
        console.log("🏓 Paddle event:", event.name, event);

        // Handle successful checkout
        if (event.name === "checkout.completed") {
          console.log("✅ Checkout completed!", event.data);
          // TODO: Update user tier in Firestore
          // This should be done via webhook for security, but we can show success UI here
        }

        // Handle checkout closed
        if (event.name === "checkout.closed") {
          console.log("❌ Checkout closed");
        }
      },
    })
      .then((paddleInstance) => {
        if (paddleInstance) {
          setPaddle(paddleInstance);
          console.log(`🏓 Paddle initialized (${PADDLE_ENVIRONMENT})`);
        }
      })
      .catch((err) => {
        console.error("❌ Failed to initialize Paddle:", err);
        setError("Failed to initialize payment system");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isConfigured]);

  const openCheckout = useCallback(
    (period: "monthly" | "yearly") => {
      if (!paddle) {
        console.error("Paddle not initialized");
        setError("Payment system not ready. Please try again.");
        return;
      }

      const priceId = getPriceId(period);
      if (!priceId) {
        console.error(`No price ID configured for ${period}`);
        setError(`Price not configured for ${period} billing`);
        return;
      }

      console.log(`🏓 Opening checkout for ${period} (price: ${priceId})`);

      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: user?.email ? { email: user.email } : undefined,
        customData: {
          userId: user?.uid || "anonymous",
          source: "pricing_page",
        },
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: "en",
          successUrl: `${window.location.origin}/studio?upgraded=true`,
        },
      });
    },
    [paddle, user]
  );

  return (
    <PaddleContext.Provider
      value={{
        paddle,
        isLoading,
        isConfigured,
        openCheckout,
        error,
      }}
    >
      {children}
    </PaddleContext.Provider>
  );
}
