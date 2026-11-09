import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type Props = {
  state: boolean | "indeterminate";
  onToggleAll: () => void;
  count: number;
  onClear: () => void;
  title: ReactNode;
  trailing?: ReactNode;
  actions: ReactNode;
  note?: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function SelectionToolbar({
  state,
  onToggleAll,
  count,
  onClear,
  title,
  trailing,
  actions,
  note,
  disabled,
  className,
}: Props) {
  const selecting = count > 0;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        role="toolbar"
        aria-label="Task selection"
        className="flex min-h-11 items-center gap-2"
      >
        <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
          <Checkbox
            checked={state}
            onCheckedChange={onToggleAll}
            disabled={disabled}
            aria-label={state === true ? "Clear selection" : "Select all"}
          />
        </label>

        {selecting ? (
          <>
            <span className="text-sm font-medium" aria-live="polite">
              {count} selected
            </span>
            <div className="ml-auto flex items-center gap-2">
              {actions}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClear}
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1">{title}</div>
            {trailing}
          </>
        )}
      </div>

      {selecting && note && (
        <p className="pl-[3.25rem] text-xs text-muted-foreground">{note}</p>
      )}
    </div>
  );
}
