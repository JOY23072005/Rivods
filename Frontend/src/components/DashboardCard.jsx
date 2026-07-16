const DashboardCard = ({ icon: Icon, title, value, color }) => (
  <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-center gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${color}`}><Icon size={22} /></div>
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground/60">{title}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);
export default DashboardCard;