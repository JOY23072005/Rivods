import { ChevronLeft, ChevronRight, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import ErrorDisplay from "./ErrorDisplay";

export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  error = null,            // New prop to capture API/fetch failures
  onRetry = () => {},      // Callback triggered when clicking "Retry"
  pagination = null,
  onPageChange = () => {},
  emptyMessage = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
  emptyIcon: EmptyIcon,
  renderRow,
}) {
  // If there's an error, intercept rendering and show the alert layout cleanly right here
  if (error) {
    return (
      <ErrorDisplay
          title="Couldn't load dashboard" 
          message={error} 
          onRetry={onRetry} 
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm table-fixed min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-foreground/5">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-3 py-4 font-medium text-foreground/60 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border last:border-0">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="p-4">
                      <div className={`animate-pulse bg-foreground/10 rounded ${col.skeletonClass || "h-3 w-full"}`} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {EmptyIcon ? <EmptyIcon size={22} /> : <Loader2 className="animate-spin" size={22} />}
                    </div>
                    <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
                    <p className="text-xs text-foreground/50">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between border-t border-border p-4">
          <p className="text-xs text-foreground/50">
            Page {pagination.page} of {pagination.totalPages} &middot; {pagination.totalItems} total
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrevPage}
              onClick={() => onPageChange(pagination.page - 1)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange(pagination.page + 1)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}