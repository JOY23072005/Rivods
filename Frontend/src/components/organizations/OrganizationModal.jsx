import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import OrganizationForm from "./OrganizationForm";
import {
  createOrganization,
  updateOrganization,
  uploadOrganizationLogo,
} from "../../api/organizations.js";

export default function OrganizationModal({ mode, organization, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = mode === "edit";

  // Reset transient state whenever the modal is opened/closed or target org changes
  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
    }
  }, [open, organization]);

  if (!open) return null;

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const { logo, ...organizationData } = values;

      let response;

      if (isEdit) {
        response = await updateOrganization(
          organization.orgid,
          organizationData
        );

        if (logo instanceof File) {
          console.log("trying to upload");
          await uploadOrganizationLogo(
            organization.orgid,
            logo
          );
          console.log("uploaded");
        }

      } else {
        response = await createOrganization(
          organizationData
        );

        const orgId =
          response.organization?.orgid ||
          response.organization?._id;

        if (logo instanceof File && orgId) {
          await uploadOrganizationLogo(
            orgId,
            logo
          );
        }
      }

      onSuccess?.(response);

      onClose?.();

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        `Failed to ${
          isEdit ? "update" : "create"
        } organization.`
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
            {isEdit ? "Edit Organization" : "Create Organization"}
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

          <OrganizationForm
            initialValues={isEdit ? organization : null}
            loading={loading}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}