"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ShareModal } from "./ShareModal";

interface ShareButtonProps {
  projectId: string;
  projectName: string;
  isShared: boolean;
  shareId: string | null;
  onShareSuccess?: (shareId: string) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  projectId,
  projectName,
  isShared,
  shareId,
  onShareSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleShareSuccess = (newShareId: string) => {
    onShareSuccess?.(newShareId);
    // ✅ УБРАЛИ: setIsModalOpen(false);
    // Теперь modal НЕ закрывается после Share!
    // Закрывается только при клике на X или Cancel
  };

  return (
    <>
      <Button onClick={handleOpenModal} variant="secondary">
        <Share2 size={16} />
        {isShared ? "Manage Share" : "Share"}
      </Button>

      {isModalOpen && (
        <ShareModal
          projectId={projectId}
          projectName={projectName}
          isShared={isShared}
          shareId={shareId}
          onClose={handleCloseModal}
          onSuccess={handleShareSuccess}
        />
      )}
    </>
  );
};
