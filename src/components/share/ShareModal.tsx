"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Copy, Check, Link2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRadiusStore } from "@/store/radiusStore";
import {
  shareProject,
  unshareProject,
  getSharedProject,
  getUserSharedProjectsCount,
} from "@/services/shareService";
import { Button } from "@/components/ui/Button";
import { useTierCheck } from "@/hooks/useTierCheck";
import { useToast } from "@/contexts/ToastContext";

interface ShareModalProps {
  projectId: string;
  projectName: string;
  isShared: boolean;
  shareId: string | null;
  onClose: () => void;
  onSuccess: (shareId: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  projectId,
  projectName,
  isShared,
  shareId,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { radii } = useRadiusStore();
  const { checkLimit } = useTierCheck();
  const toast = useToast();
  const [name, setName] = useState(projectName);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [makeDiscoverable, setMakeDiscoverable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentShareId, setCurrentShareId] = useState(shareId);
  const [justShared, setJustShared] = useState(false);

  // Загрузить существующие данные если уже расшарен
  const loadSharedProjectData = useCallback(async () => {
    if (!shareId) return;

    try {
      const sharedProject = await getSharedProject(shareId);
      if (sharedProject) {
        setDescription(sharedProject.description);
        setTags(sharedProject.tags.join(", "));
        setMakeDiscoverable(sharedProject.isDiscoverable);
      }
    } catch (error) {
      console.error("Failed to load shared project:", error);
    }
  }, [shareId]);

  useEffect(() => {
    if (isShared && shareId) {
      loadSharedProjectData();
    }
  }, [isShared, shareId, loadSharedProjectData]);

  const handleShare = async () => {
    if (!user) return;

    // ✅ NEW: Check share limit for new shares
    if (!currentShareId) {
      try {
        const userSharesCount = await getUserSharedProjectsCount(user.uid);
        const actualCheck = checkLimit("maxShares", userSharesCount);

        if (!actualCheck.allowed) {
          toast.warning(
            `You have ${userSharesCount} shared project${userSharesCount !== 1 ? "s" : ""}. Upgrade to Pro for unlimited shares!`,
            "Share Limit Reached"
          );
          return;
        }

        // Show warning when close to limit
        if (!actualCheck.isUnlimited && actualCheck.remaining <= 1 && actualCheck.remaining > 0) {
          toast.warning(`Only ${actualCheck.remaining} share slot left!`, "Almost at Limit");
        }
      } catch (error) {
        console.error("Error checking share limit:", error);
      }
    }

    setLoading(true);
    try {
      // Конвертируем radii из store в формат Firebase
      const projectRadii = radii.map((r) => ({
        frequency:
          r.direction === "counterclockwise"
            ? r.rotationSpeed
            : -r.rotationSpeed,
        amplitude: r.length,
        phase: r.initialAngle,
      }));

      const project = {
        id: projectId,
        userId: user.uid,
        name: name,
        radii: projectRadii,
        shareId: currentShareId,
        createdAt: null,
        updatedAt: null,
      };

      const newShareId = await shareProject(
        project,
        user.displayName || "Anonymous",
        {
          projectName: name,
          description: description.trim() || undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0),
          makeDiscoverable,
        }
      );

      // ✅ Обновляем состояние и показываем ссылку
      setCurrentShareId(newShareId);
      setJustShared(true);
      onSuccess(newShareId);

      // ✅ Автоматически копируем ссылку при первом Share
      if (!currentShareId) {
        const url = `${window.location.origin}/project/${newShareId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }

      // ✅ УБРАЛИ onClose() - modal остается открытым!
    } catch (error) {
      console.error("Failed to share project:", error);
      alert("Failed to share project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async () => {
    if (!currentShareId) return;

    const confirmed = confirm(
      "Are you sure you want to unshare this project? The public link will stop working."
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      await unshareProject(projectId, currentShareId);
      setCurrentShareId(null);
      setJustShared(false);
      onSuccess("");
      onClose(); // ✅ Только при Unshare закрываем modal
    } catch (error) {
      console.error("Failed to unshare project:", error);
      alert("Failed to unshare project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!currentShareId) return;

    const url = `${window.location.origin}/project/${currentShareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = currentShareId
    ? `${window.location.origin}/project/${currentShareId}`
    : "";

  // Показываем ссылку если проект уже расшарен ИЛИ только что зашарили
  const showShareLink = currentShareId && (isShared || justShared);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Link2 size={20} />
            {showShareLink ? "Manage Share" : "Share Project"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Project"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="A beautiful harmonic wave pattern..."
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              {description.length}/200 characters
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tags <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sine, harmonic, audio"
            />
            <div className="text-xs text-gray-500 mt-1">
              Separate tags with commas
            </div>
          </div>

          {/* Make Discoverable */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="discoverable"
              checked={makeDiscoverable}
              onChange={(e) => setMakeDiscoverable(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
            />
            <label htmlFor="discoverable" className="text-sm text-gray-300">
              Make discoverable in Gallery (coming soon)
            </label>
          </div>

          {/* Share Link */}
          {showShareLink && (
            <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
              <div className="text-xs text-gray-400 mb-2">
                {justShared && !isShared
                  ? "✅ Link copied to clipboard!"
                  : "Share Link"}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-gray-300"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          {showShareLink ? (
            <>
              <Button
                onClick={handleUnshare}
                variant="danger"
                disabled={loading}
              >
                <Trash2 size={16} />
                Unshare
              </Button>
              <Button onClick={handleShare} disabled={loading}>
                {loading ? "Updating..." : "Update Share"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={loading}>
                {loading ? "Sharing..." : "Share Project"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
