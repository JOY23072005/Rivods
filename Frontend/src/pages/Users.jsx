import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Eye, ShieldCheck, AlertTriangle, RefreshCw, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getUsers, getAllUsers, updateUserStatus } from "../api/users";
import { useAuth } from "../context/AuthContext";
import UserModal from "../components/users/UserModal.jsx";
import ToggleSwitch from "../components/ToggleSwitch.jsx";
import UserViewDrawer from "../components/users/UserViewDrawer.jsx";
import DataTable from "../components/DataTable.jsx";
import ActionsMenu from "../components/ActionsMenu.jsx";

const ROLE_LABELS = { admin: "Platform Admin", "sub-admin": "Organization Admin", staff: "Staff", user: "Employee" };
const STATUS_FILTERS = [{ key: "all", label: "All" }, { key: "active", label: "Active" }, { key: "inactive", label: "Inactive" }];

const ROLE_FILTERS = [
  { key: "all", label: "All Roles" },
  ...Object.entries(ROLE_LABELS).map(([key, label]) => ({ key, label }))
];

export default function Users() {
  const { user: currentUser } = useAuth();
  const isPlatformAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const debounceRef = useRef(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  // Declarative Data Table columns configurations schema mapping
  const tableColumns = [
    { header: "Avatar", className: "w-20", skeletonClass: "h-10 w-10 rounded-full" },
    { header: "Name", skeletonClass: "h-3 w-32" },
    { header: "Email", skeletonClass: "h-3 w-40" },
    { header: "Employee ID", skeletonClass: "h-3 w-20" },
    { header: "Role", skeletonClass: "h-5 w-24 rounded-full" },
    ...(isPlatformAdmin ? [{ header: "Organization", skeletonClass: "h-3 w-24" }] : []),
    { header: "Status", className: "w-24", skeletonClass: "h-6 w-11 rounded-full" },
    { header: "Actions", className: "w-16", skeletonClass: "h-5 w-5" },
  ];

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); setDebouncedSearch(search); }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isActiveParam = statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined;
      const data = isPlatformAdmin 
        ? await getAllUsers({ page, limit: 10, search: debouncedSearch, role: roleFilter === "all" ? undefined : roleFilter, isActive: isActiveParam }) 
        : await getUsers({ page, limit: 10, search: debouncedSearch, role: roleFilter === "all" ? undefined : roleFilter, isActive: isActiveParam });
      setUsers(data?.users ?? []);
      setPagination(data?.pagination ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); 
  }, [page, debouncedSearch, roleFilter, statusFilter, isPlatformAdmin]);

  const handleToggle = async (targetUser) => {
    const targetId = targetUser._id;
    const nextStatus = !targetUser.isActive;
    setTogglingId(targetId);
    setUsers(prev => prev.map(u => u._id === targetId ? { ...u, isActive: nextStatus } : u));

    try {
      await updateUserStatus(targetId, nextStatus);
      toast.success(`Successfully updated status for ${targetUser.name}`);
    } catch (err) {
      setUsers(prev => prev.map(u => u._id === targetId ? { ...u, isActive: targetUser.isActive } : u));
      toast.error(err?.response?.data?.message || `Failed to update status for ${targetUser.name}.`);
    } finally {
      setTogglingId(null);
    }
  };

  const editableRolesFor = (targetRole) => {
    if (isPlatformAdmin) return ["sub-admin", "staff", "user"];
    return ["staff", "user"].includes(targetRole) ? ["staff", "user"] : [];
  };

  const openAction = (targetUser, mode) => {
    setSelectedUser(targetUser);
    if (mode === "view") setViewOpen(true);
    if (mode === "edit") { setModalMode("edit"); setModalOpen(true); }
  };

  const creatableRoles = useMemo(() => isPlatformAdmin ? ["sub-admin", "staff", "user"] : ["staff", "user"], [isPlatformAdmin]);

  if (currentUser?.role === "staff") {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-foreground/60">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="mt-1 text-sm text-foreground/60">{isPlatformAdmin ? "Manage all users across organizations." : "Manage users in your organization."}</p>
        </div>
        <button type="button" onClick={() => { setSelectedUser(null); setModalMode("create"); setModalOpen(true); }} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          <Plus size={16} /> Create User
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30">
            {ROLE_FILTERS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
            {STATUS_FILTERS.map(f => (
              <button key={f.key} type="button" onClick={() => { setStatusFilter(f.key); setPage(1); }} className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === f.key ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:bg-foreground/5"}`}>{f.label}</button>
            ))}
          </div>
        </div>
      </div>

      <DataTable
        columns={tableColumns}
        data={users}
        isLoading={isLoading}
        error={error}
        onRetry={fetchUsers}
        pagination={pagination}
        onPageChange={(nextPage) => setPage(nextPage)}
        emptyMessage="No users found"
        emptyIcon={UserCircle}
        renderRow={(u, index) => {
          const currentId = u._id;
          const openUpward = users.length > 2 && index >= users.length - 2;
          const canEditRole = editableRolesFor(u.role).length > 0;

          const userActions = [
            { label: "View", icon: Eye, onClick: () => openAction(u, "view") },
            { label: "Edit", icon: ShieldCheck, onClick: () => openAction(u, "edit"),},
          ];

          return (
            <tr key={currentId} className="border-b border-border last:border-0 transition-colors hover:bg-foreground/5">
              <td className="p-4">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                  {u.avatar_url || u.profileImage?.url ? (
                    <img src={u.avatar_url || u.profileImage?.url} alt={u.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle size={20} />
                  )}
                </div>
              </td>
              <td className="p-4 font-medium text-foreground truncate">{u.name}</td>
              <td className="p-4 text-foreground/70 truncate">{u.email}</td>
              <td className="p-4 text-foreground/70 truncate">{u.employeeId || "—"}</td>
              <td className="p-4"><span className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-medium text-foreground/70">{ROLE_LABELS[u.role] || u.role}</span></td>
              {isPlatformAdmin && <td className="p-4 text-foreground/70 truncate">{u.organization?.name || "—"}</td>}
              <td className="p-4"><ToggleSwitch isActive={u.isActive} isBusy={togglingId === currentId} onToggle={() => handleToggle(u)} /></td>
              <td className="p-4 overflow-visible">
                <ActionsMenu actions={userActions} openUpward={openUpward} />
              </td>
            </tr>
          );
        }}
      />

      <UserModal
        mode={modalMode}
        user={selectedUser}
        allowedRoles={
          modalMode === "create"
            ? creatableRoles
            : editableRolesFor(selectedUser?.role)
        }
        canEditRole={
          modalMode === "edit" &&
          editableRolesFor(selectedUser?.role).length > 0
        }
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchUsers}
      />
      <UserViewDrawer ROLE_LABELS={ROLE_LABELS} target={selectedUser} open={viewOpen} onClose={() => setViewOpen(false)} />
    </div>
  );
}