import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

const CHALLENGE_TYPE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

const toDateInputValue = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export default function ChallengeForm({ initialValues, loading, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      challengeType: initialValues?.challengeType || "",
      goalValue: initialValues?.goalValue ?? "",
      rewardCoins: initialValues?.rewardCoins ?? "",
      startDate: toDateInputValue(initialValues?.startDate),
      endDate: toDateInputValue(initialValues?.endDate),
    },
  });

  const startDate = watch("startDate");

  useEffect(() => {
    reset({
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      challengeType: initialValues?.challengeType || "",
      goalValue: initialValues?.goalValue ?? "",
      rewardCoins: initialValues?.rewardCoins ?? "",
      startDate: toDateInputValue(initialValues?.startDate),
      endDate: toDateInputValue(initialValues?.endDate),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const submitHandler = (values) => {
    onSubmit?.({
      title: values.title.trim(),
      description: values.description.trim(),
      challengeType: values.challengeType,
      goalValue: Number(values.goalValue),
      rewardCoins: Number(values.rewardCoins),
      startDate: values.startDate,
      endDate: values.endDate,
    });
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="title"
          type="text"
          placeholder="e.g. 10K Steps Challenge"
          disabled={loading}
          className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.title ? "border-red-400" : "border-border"
          }`}
          {...register("title", {
            required: "Title is required",
            minLength: { value: 2, message: "Title must be at least 2 characters" },
            maxLength: { value: 100, message: "Title must be under 100 characters" },
          })}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Describe what this challenge involves..."
          disabled={loading}
          className={`w-full resize-none rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.description ? "border-red-400" : "border-border"
          }`}
          {...register("description", {
            required: "Description is required",
            minLength: { value: 5, message: "Description must be at least 5 characters" },
          })}
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div>
        <label htmlFor="challengeType" className="mb-1.5 block text-sm font-medium text-foreground">
          Challenge Type
        </label>
        <select
          id="challengeType"
          disabled={loading}
          defaultValue=""
          className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.challengeType ? "border-red-400" : "border-border"
          }`}
          {...register("challengeType", { required: "Please select a challenge type" })}
        >
          <option value="" disabled>
            Select a type
          </option>
          {CHALLENGE_TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {errors.challengeType && <p className="mt-1 text-xs text-red-600">{errors.challengeType.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="goalValue" className="mb-1.5 block text-sm font-medium text-foreground">
            Goal Value
          </label>
          <input
            id="goalValue"
            type="number"
            placeholder="e.g. 10000"
            disabled={loading}
            className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.goalValue ? "border-red-400" : "border-border"
            }`}
            {...register("goalValue", {
              required: "Goal value is required",
              valueAsNumber: true,
              validate: (value) => (value > 0 ? true : "Goal value must be positive"),
            })}
          />
          {errors.goalValue && <p className="mt-1 text-xs text-red-600">{errors.goalValue.message}</p>}
        </div>

        <div>
          <label htmlFor="rewardCoins" className="mb-1.5 block text-sm font-medium text-foreground">
            Reward Coins
          </label>
          <input
            id="rewardCoins"
            type="number"
            placeholder="e.g. 200"
            disabled={loading}
            className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.rewardCoins ? "border-red-400" : "border-border"
            }`}
            {...register("rewardCoins", {
              required: "Reward coins is required",
              valueAsNumber: true,
              validate: (value) => (value > 0 ? true : "Reward coins must be positive"),
            })}
          />
          {errors.rewardCoins && <p className="mt-1 text-xs text-red-600">{errors.rewardCoins.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="mb-1.5 block text-sm font-medium text-foreground">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            disabled={loading}
            className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.startDate ? "border-red-400" : "border-border"
            }`}
            {...register("startDate", { required: "Start date is required" })}
          />
          {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate.message}</p>}
        </div>

        <div>
          <label htmlFor="endDate" className="mb-1.5 block text-sm font-medium text-foreground">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            disabled={loading}
            className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.endDate ? "border-red-400" : "border-border"
            }`}
            {...register("endDate", {
              required: "End date is required",
              validate: (value) =>
                !startDate || !value || value >= startDate || "End date cannot be before start date",
            })}
          />
          {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {initialValues ? "Save Changes" : "Create Challenge"}
        </button>
      </div>
    </form>
  );
}