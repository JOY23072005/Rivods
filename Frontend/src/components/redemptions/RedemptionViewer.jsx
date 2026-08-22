import { Gift, X, Calendar, UserCircle } from "lucide-react";

const STATUS_STYLES = {
  PENDING: "bg-amber-500/10 text-amber-600",
  CLAIMED: "bg-green-500/10 text-green-600",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
      STATUS_STYLES[status] || "bg-foreground/10 text-foreground/60"
    }`}
  >
    {status}
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
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function RedemptionViewer({ redemption, loading, open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">Redemption Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-foreground/10" />
              ))}
            </div>
          ) : !redemption ? (
            <p className="text-sm text-foreground/50">No redemption selected.</p>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 border-b border-border pb-5">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-border bg-foreground/5">
                  {redemption.rewardId?.image ? (
                    <img
                      src={redemption.rewardId.image}
                      alt={redemption.rewardId?.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Gift size={28} className="text-foreground/30" />
                  )}
                </div>
                <h3 className="text-center text-base font-semibold text-foreground">
                  {redemption.rewardId?.title || "—"}
                </h3>
                <StatusBadge status={redemption.status} />
              </div>

              <div className="mt-2">
                <DetailRow label="Employee">
                  <div className="flex items-center gap-2">
                    <UserCircle size={16} className="text-foreground/40" />
                    <div>
                      <p>{redemption.userId?.name || "—"}</p>
                      <p className="text-xs text-foreground/50">
                        {redemption.userId?.email || redemption.userId?.employeeId || "—"}
                      </p>
                    </div>
                  </div>
                </DetailRow>
                <DetailRow label="Reward">{redemption.rewardId?.title || "—"}</DetailRow>
                <DetailRow label="Coins Used">{redemption.coinsUsed ?? "—"}</DetailRow>
                <DetailRow label="Organization">
                  {redemption.organizationId?.name || "—"}
                  {redemption.organizationId?.code ? ` (${redemption.organizationId.code})` : ""}
                </DetailRow>
                <DetailRow label="Created At">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} className="text-foreground/40" />
                    {formatDate(redemption.createdAt)}
                  </span>
                </DetailRow>
                {redemption.status === "CLAIMED" && (
                  <>
                    <DetailRow label="Claimed At">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={14} className="text-foreground/40" />
                        {formatDate(redemption.claimedAt)}
                      </span>
                    </DetailRow>
                    <DetailRow label="Claimed By">
                      {redemption.claimedBy?.name || "—"}
                      {redemption.claimedBy?.email ? ` (${redemption.claimedBy.email})` : ""}
                    </DetailRow>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}