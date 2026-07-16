import { useEffect, useRef, useState } from "react";
import { Search, Plus, Eye, Pencil, AlertTriangle, RefreshCw, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { getOrganizations, getOrganization, toggleOrganizationStatus } from "../api/organizations.js";
import OrganizationModal from "../components/organizations/OrganizationModal.jsx";
import OrganizationDetailsDrawer from "../components/organizations/OrganizationDetailsDrawer.jsx";
import ToggleSwitch from "../components/ToggleSwitch.jsx";
import ActionsMenu from "../components/ActionsMenu.jsx";
import DataTable from "../components/DataTable.jsx"; // Import generic table engine

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const debounceRef = useRef(null);

  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingOrganization, setLoadingOrganization] = useState(false);

  const getOrgId = (org) => org?.orgid || org?.id || org?._id;

  // 1. Columns configuration metadata mapping
  const tableColumns = [
    { header: "Logo", className: "w-20", skeletonClass: "h-10 w-10 rounded-full" },
    { header: "Organization Name", skeletonClass: "h-3 w-32" },
    { header: "Organization Code", skeletonClass: "h-3 w-20" },
    { header: "Category", skeletonClass: "h-3 w-24" },
    { header: "Status", className: "w-24", skeletonClass: "h-6 w-11 rounded-full" },
    { header: "Actions", className: "w-16", skeletonClass: "h-5 w-5" },
  ];

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); setDebouncedSearch(search); }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isActiveParam = filter === "active" ? true : filter === "inactive" ? false : undefined;
      const data = await getOrganizations({ page, limit: 10, search: debouncedSearch, isActive: isActiveParam });
      setOrganizations(data?.organizations ?? []);
      setPagination(data?.pagination ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load organizations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrganizations(); }, [page, debouncedSearch, filter]);

  const handleToggle = async (org) => {
    const orgId = getOrgId(org);
    const nextStatus = !org.isActive;
    setTogglingId(orgId);
    setOrganizations(prev => prev.map(o => getOrgId(o) === orgId ? { ...o, isActive: nextStatus } : o));
    try {
      await toggleOrganizationStatus(orgId, nextStatus);
      toast.success(`Successfully updated status for ${org.name}`);
    } catch (err) {
      setOrganizations(prev => prev.map(o => getOrgId(o) === orgId ? { ...o, isActive: org.isActive } : o));
      toast.error(err?.response?.data?.message || `Failed to update status for ${org.name}.`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleView = async (org) => {
    const orgId = getOrgId(org);
    setDrawerOpen(true); setSelectedOrganization(null); setLoadingOrganization(true);
    try {
      const data = await getOrganization(orgId);
      setSelectedOrganization(data?.organization ?? data ?? org);
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to load details for ${org.name}.`);
      setDrawerOpen(false);
    } finally {
      setLoadingOrganization(false);
    }
  };

  const handleEdit = async (org) => {
    const orgId = getOrgId(org);
    setLoadingOrganization(true);
    try {
      const data = await getOrganization(orgId);
      setSelectedOrganization(data?.organization ?? data ?? org);
      setModalMode("edit"); setModalOpen(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to load organization for editing.`);
    } finally {
      setLoadingOrganization(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
          <p className="mt-1 text-sm text-foreground/60">Manage all organizations on the platform.</p>
        </div>
        <button type="button" onClick={() => { setSelectedOrganization(null); setModalMode("create"); setModalOpen(true); }} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus size={16} /> Create Organization
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search organizations..." className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
          {FILTERS.map(f => (
            <button key={f.key} type="button" onClick={() => { setFilter(f.key); setPage(1); }} className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:bg-foreground/5"}`}>{f.label}</button>
          ))}
        </div>
      </div>
      <DataTable
        columns={tableColumns}
        data={organizations}
        isLoading={isLoading}
        pagination={pagination}
        error={error}                 
        onRetry={fetchOrganizations}
        onPageChange={(nextPage) => setPage(nextPage)}
        emptyMessage="No organizations found"
        emptyIcon={Building2}
        renderRow={(org, index) => {
          const currentId = getOrgId(org);
          const openUpward = organizations.length > 2 && index >= organizations.length - 2;
          const menuActions = [
            { label: "View", icon: Eye, onClick: () => handleView(org) },
            { label: "Edit", icon: Pencil, onClick: () => handleEdit(org) },
          ];

          return (
            <tr key={currentId} className="border-b border-border last:border-0 transition-colors hover:bg-foreground/5">
              <td className="p-4">
                {org.image_url || org.logo?.url ? (
                  <img src={org.image_url || org.logo?.url} alt={org.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Building2 size={18} /></div>
                )}
              </td>
              <td className="p-4 font-medium text-foreground truncate">{org.name}</td>
              <td className="p-4 text-foreground/70 truncate">{org.code}</td>
              <td className="p-4 text-foreground/70 truncate">{org.category || "—"}</td>
              <td className="p-4"><ToggleSwitch isActive={org.isActive} isBusy={togglingId === currentId} onToggle={() => handleToggle(org)} /></td>
              <td className="p-4 overflow-visible">
                <ActionsMenu actions={menuActions} openUpward={openUpward} />
              </td>
            </tr>
          );
        }}
      />
      <OrganizationModal mode={modalMode} organization={selectedOrganization} open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchOrganizations} />
      <OrganizationDetailsDrawer organization={selectedOrganization} open={drawerOpen} loading={loadingOrganization} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}