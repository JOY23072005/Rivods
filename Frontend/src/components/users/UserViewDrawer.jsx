import { UserCircle, X } from "lucide-react";

const UserViewDrawer = ({ target, open, onClose, ROLE_LABELS }) => {
  if (!open || !target) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-card shadow-lg sm:max-w-sm">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">User Details</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-foreground/50 hover:bg-foreground/5 hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col items-center gap-3 border-b border-border pb-5">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
              {target.avatar_url || target.profileImage?.url ? (
                <img src={target.avatar_url || target.profileImage?.url} alt={target.name} className="h-full w-full object-cover" />
              ) : (
                <UserCircle size={20} />
              )}
            </div>
            <h3 className="text-center text-base font-semibold text-foreground">{target.name}</h3>
          </div>
          <div className="mt-2 space-y-4">
            {[
              ["Email", target.email], ["Employee ID", target.employeeId],
              ["Role", ROLE_LABELS[target.role] || target.role], ["Phone", target.phone],
              ["Gender", target.gender], ["Date of Birth", target.dob],
              ["Organization", target.organization?.name],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="border-b border-border pb-3 last:border-0">
                <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">{label}</p>
                <p className="mt-1 text-sm text-foreground">{value}</p>
              </div>
            ))}
            <div className="pb-3">
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">Status</p>
              <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${target.isActive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>{target.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserViewDrawer;