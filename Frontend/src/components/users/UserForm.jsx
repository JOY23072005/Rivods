import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";

const ROLE_LABELS = {
  admin: "Platform Admin",
  "sub-admin": "Organization Admin",
  staff: "Staff",
  user: "Employee",
};

const GENDER_OPTIONS = ["Male", "Female", "Other"];

export default function UserForm({ initialValues, loading, mode = "create", allowedRoles = [], canEditRole = false, onSubmit }) {
  const isEdit =
    mode === "edit";

  const isCreate =
      mode === "create";

  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(
    initialValues?.image_url || null
  );
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialValues?.name || "",
      email: initialValues?.email || "",
      password: "",
      phone: initialValues?.phone || "",
      gender: initialValues?.gender || "",
      dob: initialValues?.dob || "",
      employeeId: initialValues?.employeeId || "",
      role: initialValues?.role || allowedRoles[0] || "",
    },
  });

  const imageFile = watch("image");

  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setImagePreview(initialValues?.image_url || null);
    
    reset({
      name: initialValues?.name || "",
      email: initialValues?.email || "",
      password: "",
      phone: initialValues?.phone || "",
      gender: initialValues?.gender || "",
      dob: initialValues?.dob?.split("T")[0] || "",
      employeeId: initialValues?.employeeId || "",
      role: initialValues?.role || allowedRoles[0] || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const submitHandler = (values) => {
    onSubmit({
      name: values.name.trim(),
      phone: values.phone.trim(),
      gender: values.gender,
      dob: values.dob,
      employeeId: values.employeeId.trim(),
      role: values.role,
      email: values.email.trim(),
      password: values.password,
      image: values.image?.[0] || null,
    });
  };

  useEffect(() => {
    if (!imageFile?.length) return;

    const url = URL.createObjectURL(imageFile[0]);

    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleRemoveImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setImagePreview(initialValues?.image_url || null);
  };

  const fieldDisabled = loading;

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Profile Image
        </label>

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon size={22} />
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="rounded-md border px-3 py-2 text-sm"
            >
              <Upload
                size={15}
                className="mr-2 inline"
              />
              Upload
            </button>

            {imagePreview && (
              <button
                type="button"
                disabled={loading}
                onClick={handleRemoveImage}
                className="rounded-md border px-3 py-2 text-sm text-red-600"
              >
                <X
                  size={15}
                  className="mr-2 inline"
                />
                Remove
              </button>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            {...register("image")}
            ref={(e) => {
              register("image").ref(e);
              fileInputRef.current = e;
            }}
          />
        </div>
      </div>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
          Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g. Jane Doe"
          disabled={loading}
          className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.name ? "border-red-400" : "border-border"
          }`}
          {...register("name", {
            required:  "Name is required",
            minLength: { value: 2, message: "Name must be at least 2 characters" },
          })}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="e.g. jane@company.com"
          disabled={loading}
          readOnly={isEdit}
          className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 
          ${errors.email ? "border-red-400" : "border-border"}`}
          {...register("email", {
            required:  "Email is required",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
          })}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {isCreate && (
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Minimum 8 characters"
            disabled={loading}
            className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.password ? "border-red-400" : "border-border"
            }`}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
            })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="e.g. 9876543210"
            disabled={loading}
            className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.phone ? "border-red-400" : "border-border"
            }`}
            {...register("phone", {
              required:  "Phone is required",
              pattern: { value: /^[0-9+\-\s]{7,15}$/, message: "Enter a valid phone number" },
            })}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-foreground">
            Gender
          </label>
          <select
            id="gender"
            disabled={loading}
            defaultValue=""
            className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.gender ? "border-red-400" : "border-border"
            }`}
            {...register("gender", { required:  "Please select a gender" })}
          >
            <option value="" disabled>
              Select gender
            </option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="dob" className="mb-1.5 block text-sm font-medium text-foreground">
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            disabled={loading}
            className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.dob ? "border-red-400" : "border-border"
            }`}
            {...register("dob", { required:  "Date of birth is required" })}
          />
          {errors.dob && <p className="mt-1 text-xs text-red-600">{errors.dob.message}</p>}
        </div>

        <div>
          <label htmlFor="employeeId" className="mb-1.5 block text-sm font-medium text-foreground">
            Employee ID
          </label>
          <input
            id="employeeId"
            type="text"
            placeholder="e.g. EMP0234"
            disabled={loading}
            className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              errors.employeeId ? "border-red-400" : "border-border"
            }`}
            {...register("employeeId", { required:  "Employee ID is required" })}
          />
          {errors.employeeId && <p className="mt-1 text-xs text-red-600">{errors.employeeId.message}</p>}
        </div>
      </div>

      {canEditRole && <div>
        <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-foreground">
          Role
        </label>
        <select
          id="role"
          disabled={loading}
          className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.role ? "border-red-400" : "border-border"
          }`}
          {...register("role", { required: "Please select a role" })}
        >
          {allowedRoles.length === 0 && <option value="">No roles available</option>}
          {allowedRoles.map((roleValue) => (
            <option key={roleValue} value={roleValue}>
              {ROLE_LABELS[roleValue] || roleValue}
            </option>
          ))}
        </select>
        {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
      </div>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Save Changes" : "Create User"}
        </button>
      </div>
    </form>
  );
}