import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorDisplay({ 
  title = "Something went wrong", 
  message, 
  onRetry 
}) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-6 flex items-start gap-3 animate-in fade-in duration-200">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle size={20} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-red-700">{title}</h3>
        <p className="mt-1 text-sm text-red-600">{message}</p>
        
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          >
            <RefreshCw size={14} /> Retry
          </button>
        )}
      </div>
    </div>
  );
}