import { useEffect, useState } from "react";
import { Building2, UserCog, Users, UserCircle, Gift, Trophy, Ticket, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { getDashboard } from "../../api/dashboard.js";

const STAT_CONFIG = [
  { key: "organizations", title: "Organizations", icon: Building2, color: "bg-blue-500/10 text-blue-600" },
  { key: "subAdmins", title: "Sub Admins", icon: UserCog, color: "bg-purple-500/10 text-purple-600" },
  { key: "staff", title: "Staff", icon: Users, color: "bg-amber-500/10 text-amber-600" },
  { key: "employees", title: "Employees", icon: UserCircle, color: "bg-teal-500/10 text-teal-600" },
  { key: "rewards", title: "Rewards", icon: Gift, color: "bg-pink-500/10 text-pink-600" },
  { key: "activeChallenges", title: "Active Challenges", icon: Trophy, color: "bg-indigo-500/10 text-indigo-600" },
  { key: "pendingRedemptions", title: "Pending Redemptions", icon: Ticket, color: "bg-orange-500/10 text-orange-600" },
];

// Inlined Sub-Components via implicit arrow return syntax to shave off LOC
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

const Placeholder = ({ icon: Icon, title }) => (
  <div className="rounded-lg border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center gap-2 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon size={22} /></div>
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    <p className="text-xs text-foreground/50">Coming Soon</p>
  </div>
);

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDashboard();
      setSummary(data?.summary ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-foreground/60">Overview of your organization&apos;s activity.</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"><AlertTriangle size={20} /></div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-700">Couldn&apos;t load dashboard</h3>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button type="button" onClick={fetchDashboard} className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CONFIG.map((stat) => 
            isLoading ? (
              <div key={stat.key} className="rounded-lg border border-border bg-card p-5 shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-foreground/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-foreground/10" />
                  <div className="h-6 w-12 animate-pulse rounded bg-foreground/10" />
                </div>
              </div>
            ) : (
              <DashboardCard key={stat.key} icon={stat.icon} title={stat.title} value={summary?.[stat.key] ?? 0} color={stat.color} />
            )
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Placeholder icon={Building2} title="Recent Organizations" />
        <Placeholder icon={Clock} title="Recent Redemptions" />
      </div>
    </div>
  );
}