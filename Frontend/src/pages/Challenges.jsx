import { useEffect, useRef, useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import { getChallenges, updateChallenge, deleteChallenge } from "../api/challenge";
import DataTable from "../components/DataTable.jsx";
import ActionsMenu from "../components/ActionsMenu.jsx";
import ToggleSwitch from "../components/ToggleSwitch.jsx";
import ChallengeModal from "../components/challenges/ChallengeModal.jsx";
import ChallengeViewer from "../components/challenges/ChallengeViewer.jsx";

const CHALLENGE_TYPE_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  custom: "Custom",
};

const CHALLENGE_TYPE_FILTERS = [
  { key: "all", label: "All Types" },
  ...Object.entries(CHALLENGE_TYPE_LABELS).map(([key, label]) => ({ key, label })),
];

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const tableColumns = [
  { header: "Image", className: "w-20", skeletonClass: "h-10 w-10 rounded-full" },
  { header: "Title", skeletonClass: "h-3 w-32" },
  { header: "Challenge Type", skeletonClass: "h-5 w-20 rounded-full" },
  { header: "Goal Steps", skeletonClass: "h-3 w-16" },
  { header: "Reward Coins", skeletonClass: "h-3 w-16" },
  { header: "Organization", skeletonClass: "h-3 w-24" },
  { header: "Status", className: "w-24", skeletonClass: "h-6 w-11 rounded-full" },
  { header: "Created By", skeletonClass: "h-3 w-24" },
  { header: "Start Date", skeletonClass: "h-3 w-20" },
  { header: "End Date", skeletonClass: "h-3 w-20" },
  { header: "Actions", className: "w-16", skeletonClass: "h-5 w-5" },
];

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const debounceRef = useRef(null);

  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchChallenges = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getChallenges({
        page,
        limit: 10,
        search: debouncedSearch,
        challengeType: typeFilter === "all" ? undefined : typeFilter,
      });
      setChallenges(data?.challenges ?? []);
      setPagination(data?.pagination ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load challenges. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

//   useEffect(()=>{
//     console.log(challenges);
//   },[challenges])

  useEffect(() => {
    fetchChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, typeFilter]);

  const handleToggleStatus = async (targetChallenge) => {
    const targetId = targetChallenge.challengeId;
    const nextStatus = !targetChallenge.isActive;
    setTogglingId(targetId);
    setChallenges((prev) =>
      prev.map((c) => (c.challengeId === targetId ? { ...c, isActive: nextStatus } : c))
    );

    try {
      await updateChallenge(targetId, { isActive: nextStatus });
      toast.success(`Successfully updated status for ${targetChallenge.title}`);
    } catch (err) {
      setChallenges((prev) =>
        prev.map((c) => (c.challengeId === targetId ? { ...c, isActive: targetChallenge.isActive } : c))
      );
      toast.error(err?.response?.data?.message || `Failed to update status for ${targetChallenge.title}.`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (targetChallenge) => {
    const confirmed = window.confirm(`Delete "${targetChallenge.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteChallenge(targetChallenge.challengeId);
      toast.success(`Deleted ${targetChallenge.title}`);
      fetchChallenges();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to delete ${targetChallenge.title}.`);
    }
  };

  const openAction = (targetChallenge, mode) => {
    setSelectedChallenge(targetChallenge);
    if (mode === "view") setViewOpen(true);
    if (mode === "edit") {
      setModalMode("edit");
      setModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Challenges</h1>
          <p className="mt-1 text-sm text-foreground/60">Manage engagement challenges for employees.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedChallenge(null);
            setModalMode("create");
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> Add Challenge
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search challenges..."
            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground/40 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
        >
          {CHALLENGE_TYPE_FILTERS.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={tableColumns}
        data={challenges}
        isLoading={isLoading}
        error={error}
        onRetry={fetchChallenges}
        pagination={pagination}
        onPageChange={(nextPage) => setPage(nextPage)}
        emptyMessage="No challenges found"
        emptyIcon={Trophy}
        renderRow={(challenge, index) => {
          const currentId = challenge.challengeId;
          const openUpward = challenges.length > 2 && index >= challenges.length - 2;

          const challengeActions = [
            { label: "View", icon: Eye, onClick: () => openAction(challenge, "view") },
            { label: "Edit", icon: Pencil, onClick: () => openAction(challenge, "edit") },
            { label: "Delete", icon: Trash2, onClick: () => handleDelete(challenge), danger: true },
          ];

          return (
            <tr key={currentId} className="border-b border-border last:border-0 transition-colors hover:bg-foreground/5">
              <td className="p-4">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                  {challenge.image ? (
                    <img src={challenge.image} alt={challenge.title} className="h-full w-full object-cover" />
                  ) : (
                    <Trophy size={18} />
                  )}
                </div>
              </td>
              <td className="p-4 font-medium text-foreground truncate">{challenge.title}</td>
              <td className="p-4">
                <span className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-medium text-foreground/70">
                  {CHALLENGE_TYPE_LABELS[challenge.challengeType] || challenge.challengeType}
                </span>
              </td>
              <td className="p-4 text-foreground/70">{challenge.goalValue}</td>
              <td className="p-4 text-foreground/70">{challenge.rewardCoins}</td>
              <td className="p-4 text-foreground/70 truncate">{challenge.organization || "—"}</td>
              <td className="p-4">
                <ToggleSwitch
                  isActive={challenge.isActive}
                  isBusy={togglingId === currentId}
                  onToggle={() => handleToggleStatus(challenge)}
                />
              </td>
              <td className="p-4 text-foreground/70 truncate">{challenge.createdBy || "—"}</td>
              <td className="p-4 text-foreground/70">{formatDate(challenge.startDate)}</td>
              <td className="p-4 text-foreground/70">{formatDate(challenge.endDate)}</td>
              <td className="p-4 overflow-visible">
                <ActionsMenu actions={challengeActions} openUpward={openUpward} />
              </td>
            </tr>
          );
        }}
      />

      <ChallengeModal
        mode={modalMode}
        challenge={selectedChallenge}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchChallenges}
      />

      <ChallengeViewer challenge={selectedChallenge} open={viewOpen} onClose={() => setViewOpen(false)} />
    </div>
  );
}