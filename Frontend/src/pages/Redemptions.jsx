import { useEffect, useRef, useState } from "react";
import { Search, Eye, CheckCircle2, Gift, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getAdminRedemptions, getRedemptionById, claimReward } from "../api/redemptions";
import DataTable from "../components/DataTable.jsx";
import ActionsMenu from "../components/ActionsMenu.jsx";
import RedemptionViewer from "../components/redemptions/RedemptionViewer.jsx";

const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CLAIMED", label: "Claimed" },
];

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

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

// Lightweight confirmation dialog, kept local to this page (per "no unnecessary
// new abstractions") — same modal shell/spacing/buttons as the rest of the app.
const ClaimConfirmDialog = ({ redemption, loading, open, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel?.()}
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-card shadow-lg">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">Claim Redemption</h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-foreground/70">
            Confirm that <span className="font-medium text-foreground">{redemption?.userId?.name || "this employee"}</span>{" "}
            has received <span className="font-medium text-foreground">{redemption?.rewardId?.title || "this reward"}</span>.
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-border p-5">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Claiming..." : "Confirm Claim"}
          </button>
        </div>
      </div>
    </div>
  );
};

const tableColumns = [
  { header: "Employee", skeletonClass: "h-3 w-32" },
  { header: "Reward", skeletonClass: "h-3 w-32" },
  { header: "Coins", skeletonClass: "h-3 w-12" },
  { header: "Organization", skeletonClass: "h-3 w-24" },
  { header: "Status", className: "w-24", skeletonClass: "h-5 w-20 rounded-full" },
  { header: "Created At", skeletonClass: "h-3 w-20" },
  { header: "Actions", className: "w-16", skeletonClass: "h-5 w-5" },
];

export default function Redemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [loadingView, setLoadingView] = useState(false);

  const [claimTarget, setClaimTarget] = useState(null);
  const [claimConfirmOpen, setClaimConfirmOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchRedemptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminRedemptions({
        page,
        limit: 10,
        search: debouncedSearch,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setRedemptions(data?.redemptions ?? []);
      setPagination(data?.pagination ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load redemptions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, statusFilter]);

  const handleView = async (redemption) => {
    setSelectedRedemption(redemption);
    setViewOpen(true);
    setLoadingView(true);
    try {
      const data = await getRedemptionById(redemption._id);
      setSelectedRedemption(data?.redemption ?? data ?? redemption);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load redemption details.");
    } finally {
      setLoadingView(false);
    }
  };

  const handleClaimClick = (redemption) => {
    setClaimTarget(redemption);
    setClaimConfirmOpen(true);
  };

  const handleClaimConfirm = async () => {
    if (!claimTarget) return;
    setClaiming(true);
    try {
      await claimReward(claimTarget._id);
      toast.success(`Marked as claimed for ${claimTarget.userId?.name || "employee"}`);
      setClaimConfirmOpen(false);
      setClaimTarget(null);
      fetchRedemptions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to claim redemption. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Redemptions</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Manage employee reward redemption requests and mark them as claimed.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search redemptions..."
            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setStatusFilter(f.key);
                setPage(1);
              }}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:bg-foreground/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={tableColumns}
        data={redemptions}
        isLoading={isLoading}
        error={error}
        onRetry={fetchRedemptions}
        pagination={pagination}
        onPageChange={(nextPage) => setPage(nextPage)}
        emptyMessage="No redemptions found"
        emptyIcon={Gift}
        renderRow={(redemption, index) => {
          const currentId = redemption._id;
          const openUpward = redemptions.length > 2 && index >= redemptions.length - 2;

          const redemptionActions = [
            { label: "View", icon: Eye, onClick: () => handleView(redemption) },
            ...(redemption.status === "PENDING"
              ? [{ label: "Claim", icon: CheckCircle2, onClick: () => handleClaimClick(redemption) }]
              : []),
          ];

          return (
            <tr key={currentId} className="border-b border-border last:border-0 transition-colors hover:bg-foreground/5">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                    <UserCircle size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{redemption.userId?.name || "—"}</p>
                    <p className="truncate text-xs text-foreground/50">
                      {redemption.userId?.email || redemption.userId?.employeeId || "—"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                    {redemption.rewardId?.image ? (
                      <img src={redemption.rewardId.image} alt={redemption.rewardId?.title} className="h-full w-full object-cover" />
                    ) : (
                      <Gift size={16} />
                    )}
                  </div>
                  <p className="truncate font-medium text-foreground">{redemption.rewardId?.title || "—"}</p>
                </div>
              </td>
              <td className="p-4 text-foreground/70">{redemption.coinsUsed ?? "—"}</td>
              <td className="p-4 text-foreground/70 truncate">
                {redemption.organizationId?.name || "—"}
                {redemption.organizationId?.code ? ` (${redemption.organizationId.code})` : ""}
              </td>
              <td className="p-4"><StatusBadge status={redemption.status} /></td>
              <td className="p-4 text-foreground/70">{formatDate(redemption.createdAt)}</td>
              <td className="p-4 overflow-visible">
                <ActionsMenu actions={redemptionActions} openUpward={openUpward} />
              </td>
            </tr>
          );
        }}
      />

      <RedemptionViewer
        redemption={selectedRedemption}
        loading={loadingView}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
      />

      <ClaimConfirmDialog
        redemption={claimTarget}
        loading={claiming}
        open={claimConfirmOpen}
        onCancel={() => {
          if (!claiming) {
            setClaimConfirmOpen(false);
            setClaimTarget(null);
          }
        }}
        onConfirm={handleClaimConfirm}
      />
    </div>
  );
}