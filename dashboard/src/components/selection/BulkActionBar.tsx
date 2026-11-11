import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  count: number;
  onClear: () => void;
  children: ReactNode; // the screen's own action buttons
  note?: ReactNode;
  className?: string;
};

export function BulkActionBar({
  count,
  onClear,
  children,
  note,
  className,
}: Props) {
  if (count === 0) return null;
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm",
        className,
      )}
    >
      <span className="text-sm font-medium" aria-live="polite">
        {count} selected
      </span>
      <div className="ml-auto flex items-center gap-2">
        {children}
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>
      {note && (
        <p className="basis-full text-xs text-muted-foreground">{note}</p>
      )}
    </div>
  );
}
