import { useEffect, useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ChallengeForm from "./ChallengeForm.jsx";
import { createChallenge, updateChallenge } from "../../api/challenge";

export default function ChallengeModal({ mode, challenge, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
    }
  }, [open, challenge]);

  if (!open) return null;

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const response = isEdit
        ? await updateChallenge(challenge.challengeId, values)
        : await createChallenge(values);

      toast.success(isEdit ? "Challenge updated successfully" : "Challenge created successfully");
      onSuccess?.(response);
      onClose?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} challenge. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit Challenge" : "Add Challenge"}
          </h2>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-md p-1.5 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && !error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-foreground/60">
              <Loader2 size={14} className="animate-spin" />
              {isEdit ? "Saving changes..." : "Creating challenge..."}
            </div>
          )}

          <ChallengeForm initialValues={isEdit ? challenge : null} loading={loading} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}