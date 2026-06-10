"use client";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compact "swap From / To" affordance used inside search/publish forms.
 * Sits between the two PlacePickers, vertically centred, with a clear
 * hover/focus state and a 180° icon flip on press for a tactile feel.
 */
export function SwapPlacesButton({
  onClick,
  className,
  disabled,
}: {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Swap from and to"
      title="Swap from and to"
      className={cn(
        // Mobile: a small inline pill in the form's flow.
        // Desktop: a circular icon-button that hovers cleanly between fields.
        "group inline-flex items-center justify-center self-center shrink-0",
        "h-10 w-10 rounded-full border border-input bg-background text-muted-foreground",
        "shadow-sm hover:text-brand-700 hover:border-brand-200 hover:bg-brand-50",
        "active:scale-95 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        className
      )}
    >
      <ArrowLeftRight
        className="h-4 w-4 transition-transform duration-200 group-active:rotate-180"
        aria-hidden="true"
      />
    </button>
  );
}
