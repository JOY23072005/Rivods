import { useEffect, useState } from "react";
import { Building2, UserCog, Users, UserCircle, Gift, Trophy, Ticket, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { getDashboard } from "../../api/dashboard.js";
import DashboardCard from "../../components/DashboardCard.jsx";
import Placeholder from "../../components/Placeholder.jsx";
import ErrorDisplay from "../../components/ErrorDisplay.jsx";

const STAT_CONFIG = [
  { key: "organizations", title: "Organizations", icon: Building2, color: "bg-blue-500/10 text-blue-600" },
  { key: "subAdmins", title: "Sub Admins", icon: UserCog, color: "bg-purple-500/10 text-purple-600" },
  { key: "staff", title: "Staff", icon: Users, color: "bg-amber-500/10 text-amber-600" },
  { key: "employees", title: "Employees", icon: UserCircle, color: "bg-teal-500/10 text-teal-600" },
  { key: "rewards", title: "Rewards", icon: Gift, color: "bg-pink-500/10 text-pink-600" },
  { key: "activeChallenges", title: "Active Challenges", icon: Trophy, color: "bg-indigo-500/10 text-indigo-600" },
  { key: "pendingRedemptions", title: "Pending Redemptions", icon: Ticket, color: "bg-orange-500/10 text-orange-600" },
];

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
        <ErrorDisplay 
          title="Couldn't load dashboard" 
          message={error} 
          onRetry={fetchDashboard} 
        />
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