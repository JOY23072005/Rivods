import { Trophy, X, Calendar } from "lucide-react";

const CHALLENGE_TYPE_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  custom: "Custom",
};

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
      isActive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
    }`}
  >
    {isActive ? "Active" : "Inactive"}
  </span>
);

const DetailRow = ({ label, children }) => (
  <div className="border-b border-border py-4 last:border-0">
    <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">{label}</p>
    <div className="mt-1.5 text-sm text-foreground">{children}</div>
  </div>
);

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};

export default function ChallengeViewer({ challenge, open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">Challenge Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          {!challenge ? (
            <p className="text-sm text-foreground/50">No challenge selected.</p>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 border-b border-border pb-5">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-border bg-foreground/5">
                  {challenge.image ? (
                    <img src={challenge.image} alt={challenge.title} className="h-full w-full object-cover" />
                  ) : (
                    <Trophy size={28} className="text-foreground/30" />
                  )}
                </div>
                <h3 className="text-center text-base font-semibold text-foreground">{challenge.title}</h3>
              </div>

              <div className="mt-2">
                <DetailRow label="Description">{challenge.description || "—"}</DetailRow>
                <DetailRow label="Challenge Type">
                  {CHALLENGE_TYPE_LABELS[challenge.challengeType] || challenge.challengeType || "—"}
                </DetailRow>
                <DetailRow label="Goal Steps">{challenge.goalValue ?? "—"}</DetailRow>
                <DetailRow label="Reward Coins">{challenge.rewardCoins ?? "—"}</DetailRow>
                <DetailRow label="Organization">{challenge.organization || "—"}</DetailRow>
                <DetailRow label="Created By">{challenge.createdBy|| "—"}</DetailRow>
                <DetailRow label="Status">
                  <StatusBadge isActive={challenge.isActive} />
                </DetailRow>
                <DetailRow label="Start Date">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} className="text-foreground/40" />
                    {formatDate(challenge.startDate)}
                  </span>
                </DetailRow>
                <DetailRow label="End Date">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} className="text-foreground/40" />
                    {formatDate(challenge.endDate)}
                  </span>
                </DetailRow>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}