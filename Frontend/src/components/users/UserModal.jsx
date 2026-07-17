import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import UserForm from "./UserForm";
import { createUser, updateUserRole, updateUser, updateUserProfileImage } from "../../api/users";
import toast from "react-hot-toast";

export default function UserModal({ mode, user, allowedRoles, canEditRole, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
    }
  }, [open, user]);

  if (!open) return null;

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    let userId;
    try {
      if (isCreate) {
          const res = await createUser(values);
          userId = res?.user._id;
      }
      else {
          await updateUser(user._id, {
            name: values.name,
            phone: values.phone,
            gender: values.gender,
            dob: values.dob,
            employeeId: values.employeeId,
          });

          if (
            values.role !== user.role &&
            canEditRole
          ) {
            await updateUserRole(
              user._id,
              values.role
            );
          }
          userId = user._id;
      }
      console.log(values);
      
      if (values.image) {
        await updateUserProfileImage(
          userId,
          values.image
        );
      }

      toast.success("User updated");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          `Failed to ${isEdit ? "update role" : "create user"}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit User" : "Create User"}
          </h2>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-md p-1.5 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <UserForm
            initialValues={isEdit ? user : null}
            loading={loading}
            mode={mode}
            allowedRoles={allowedRoles}
            onSubmit={handleSubmit}
            canEditRole={canEditRole}
          />
        </div>
      </div>
    </div>
  );
}