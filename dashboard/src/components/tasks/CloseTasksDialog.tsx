import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClosePlan } from "@/lib/tasks";

type Props = {
  plan: ClosePlan | null;
  canDismiss: boolean;
  busy: boolean;
  onCloseReady: () => void;
  onDismiss: () => void;
  onCancel: () => void;
};

function heading(blocked: number, total: number) {
  if (blocked === total) {
    return blocked === 1
      ? "This task can't be marked done yet"
      : `These ${blocked} tasks can't be marked done yet`;
  }
  return `${blocked} of ${total} tasks can't be marked done yet`;
}

export function CloseTasksDialog({
  plan,
  canDismiss,
  busy,
  onCloseReady,
  onDismiss,
  onCancel,
}: Props) {
  const blocked = plan?.unresolved.length ?? 0;
  const ready = plan?.ready.length ?? 0;

  return (
    <Dialog open={!!plan} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{heading(blocked, blocked + ready)}</DialogTitle>
          <DialogDescription>
            These are automatic checks and the problem still exists. Fix it
            first
            {canDismiss
              ? ", or dismiss with a reason."
              : ", or ask a manager to dismiss them."}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2">
          {plan?.unresolved.map((u) => (
            <li
              key={u.id}
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/40"
            >
              <p className="text-sm font-medium">{u.title}</p>
              <p className="text-xs text-muted-foreground">{u.reason}</p>
            </li>
          ))}
        </ul>

        {plan && plan.skipped.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Skipped:{" "}
            {plan.skipped.map((s) => `${s.title} (${s.reason})`).join("; ")}
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          {canDismiss && (
            <Button variant="outline" onClick={onDismiss} disabled={busy}>
              Dismiss {blocked}…
            </Button>
          )}
          {ready > 0 && (
            <Button onClick={onCloseReady} disabled={busy}>
              Close the other {ready}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
