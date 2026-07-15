import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  AlertTriangle,
  RefreshCw,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { getOrganizations, toggleOrganizationStatus } from "../api/organizations";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

const ToggleSwitch = ({ isActive, isBusy, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={isActive}
    disabled={isBusy}
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
      isActive ? "bg-green-500" : "bg-foreground/20"
    }`}
  >
    <span
      className={`inline-block h-4.5 w-4.5 h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
        isActive ? "translate-x-[22px]" : "translate-x-1"
      }`}
    />
  </button>
);

const ActionsMenu = ({ org, openId, setOpenId }) => {
  const isOpen = openId === org.orgid;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpenId(isOpen ? null : org.orgid)}
        className="rounded-md p-1.5 text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpenId(null)} />
          <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-md">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
            >
              <Eye size={15} /> View
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
            >
              <Pencil size={15} /> Edit
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-border last:border-0">
    <td className="p-4"><div className="h-10 w-10 animate-pulse rounded-full bg-foreground/10" /></td>
    <td className="p-4"><div className="h-3 w-32 animate-pulse rounded bg-foreground/10" /></td>
    <td className="p-4"><div className="h-3 w-20 animate-pulse rounded bg-foreground/10" /></td>
    <td className="p-4"><div className="h-3 w-24 animate-pulse rounded bg-foreground/10" /></td>
    <td className="p-4"><div className="h-6 w-11 animate-pulse rounded-full bg-foreground/10" /></td>
    <td className="p-4"><div className="h-5 w-5 animate-pulse rounded bg-foreground/10" /></td>
  </tr>
);

const ErrorToast = ({ message, onClose }) => (
  <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 shadow-md animate-in fade-in slide-in-from-bottom-2">
    <AlertTriangle size={18} className="shrink-0 text-red-600" />
    <p className="text-sm text-red-700">{message}</p>
    <button
      type="button"
      onClick={onClose}
      className="ml-2 rounded-md p-1 text-red-500 transition-colors hover:bg-red-100"
    >
      <X size={14} />
    </button>
  </div>
);

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [toast, setToast] = useState(null);
  const debounceRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isActiveParam =
        filter === "active" ? true : filter === "inactive" ? false : undefined;
      const data = await getOrganizations({
        page,
        limit: 10,
        search: debouncedSearch,
        isActive: isActiveParam,
      });
      setOrganizations(data?.organizations ?? []);
      setPagination(data?.pagination ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load organizations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, filter]);

  const showToast = (message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  };

  const handleToggle = async (org) => {
    const nextStatus = !org.isActive;
    setTogglingId(org.orgid);

    // Optimistic update
    setOrganizations((prev) =>
      prev.map((o) => (o.orgid === org.orgid ? { ...o, isActive: nextStatus } : o))
    );

    try {
      await toggleOrganizationStatus(org.orgid, nextStatus);
    } catch (err) {
      // Rollback
      setOrganizations((prev) =>
        prev.map((o) => (o.orgid === org.orgid ? { ...o, isActive: org.isActive } : o))
      );
      showToast(
        err?.response?.data?.message || `Failed to update status for ${org.name}. Please try again.`
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
          <p className="mt-1 text-sm text-foreground/60">Manage all organizations on the platform.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> Create Organization
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:bg-foreground/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-700">Couldn&apos;t load organizations</h3>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchOrganizations}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-foreground/5">
                  <th className="p-4 font-medium text-foreground/60">Logo</th>
                  <th className="p-4 font-medium text-foreground/60">Organization Name</th>
                  <th className="p-4 font-medium text-foreground/60">Organization Code</th>
                  <th className="p-4 font-medium text-foreground/60">Category</th>
                  <th className="p-4 font-medium text-foreground/60">Status</th>
                  <th className="p-4 font-medium text-foreground/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : organizations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Building2 size={22} />
                        </div>
                        <p className="text-sm font-medium text-foreground">No organizations found</p>
                        <p className="text-xs text-foreground/50">Try adjusting your search or filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  organizations.map((org) => (
                    <tr key={org.orgid} className="border-b border-border last:border-0 transition-colors hover:bg-foreground/5">
                      <td className="p-4">
                        {org.image_url ? (
                          <img
                            src={org.image_url}
                            alt={org.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Building2 size={18} />
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-medium text-foreground">{org.name}</td>
                      <td className="p-4 text-foreground/70">{org.code}</td>
                      <td className="p-4 text-foreground/70">{org.category}</td>
                      <td className="p-4">
                        <ToggleSwitch
                          isActive={org.isActive}
                          isBusy={togglingId === org.orgid}
                          onToggle={() => handleToggle(org)}
                        />
                      </td>
                      <td className="p-4">
                        <ActionsMenu org={org} openId={openMenuId} setOpenId={setOpenMenuId} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="flex items-center justify-between border-t border-border p-4">
              <p className="text-xs text-foreground/50">
                Page {pagination.page} of {pagination.totalPages} &middot; {pagination.totalItems} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {toast && <ErrorToast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}