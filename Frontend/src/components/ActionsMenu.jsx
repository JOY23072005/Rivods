import { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";

export default function ActionsMenu({ actions = [], openUpward = false }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-md p-1.5 text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <>
          {/* Global overlay backdrop to catch clicks outside the menu */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div
            className={`absolute right-0 z-20 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-md ${
              openUpward ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {actions.map((action, i) => {
              // Safely skip rendering if a conditional check fails (e.g., canEditRole logic)
              if (action.show === false) return null;

              const Icon = action.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    action.onClick();
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-foreground/5 ${
                    action.className || "text-foreground/80"
                  }`}
                >
                  {Icon && <Icon size={15} />}
                  {action.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}