const Placeholder = ({ icon: Icon, title }) => (
  <div className="rounded-lg border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center gap-2 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon size={22} /></div>
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    <p className="text-xs text-foreground/50">Coming Soon</p>
  </div>
);
export default Placeholder;