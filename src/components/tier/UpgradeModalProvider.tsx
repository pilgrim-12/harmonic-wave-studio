"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UpgradeModal } from "./UpgradeModal";
import { UserTier } from "@/config/tiers";

interface UpgradeModalContextType {
  showUpgradeModal: (feature?: string, requiredTier?: UserTier) => void;
  closeUpgradeModal: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType | undefined>(
  undefined
);

export const useUpgradeModal = () => {
  const context = useContext(UpgradeModalContext);
  if (!context) {
    throw new Error(
      "useUpgradeModal must be used within UpgradeModalProvider"
    );
  }
  return context;
};

interface UpgradeModalProviderProps {
  children: React.ReactNode;
}

export const UpgradeModalProvider: React.FC<UpgradeModalProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState<string | undefined>();
  const [requiredTier, setRequiredTier] = useState<UserTier>("pro");

  const showUpgradeModal = (
    featureName?: string,
    tier: UserTier = "pro"
  ) => {
    setFeature(featureName);
    setRequiredTier(tier);
    setIsOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsOpen(false);
    setFeature(undefined);
  };

  // Listen to custom event from useTierCheck hook
  useEffect(() => {
    const handleShowUpgrade = (event: Event) => {
      const customEvent = event as CustomEvent<{
        feature?: string;
        requiredTier?: UserTier;
      }>;
      showUpgradeModal(
        customEvent.detail.feature,
        customEvent.detail.requiredTier
      );
    };

    window.addEventListener("show-upgrade-modal", handleShowUpgrade);

    return () => {
      window.removeEventListener("show-upgrade-modal", handleShowUpgrade);
    };
  }, []);

  return (
    <UpgradeModalContext.Provider
      value={{ showUpgradeModal, closeUpgradeModal }}
    >
      {children}
      <UpgradeModal
        isOpen={isOpen}
        onClose={closeUpgradeModal}
        feature={feature}
        requiredTier={requiredTier}
      />
    </UpgradeModalContext.Provider>
  );
};
