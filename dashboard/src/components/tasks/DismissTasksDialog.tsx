import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DISMISS_REASONS } from "@/lib/tasks";

const OTHER = "Other";

type Props = {
  ids: number[] | null;
  busy: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

export function DismissTasksDialog({ ids, busy, onConfirm, onCancel }: Props) {
  const [choice, setChoice] = useState(DISMISS_REASONS[0]);
  const [other, setOther] = useState("");
  const reason = choice === OTHER ? other.trim() : choice;

  useEffect(() => {
    if (ids) {
      setChoice(DISMISS_REASONS[0]);
      setOther("");
    }
  }, [ids]);

  const count = ids?.length ?? 0;

  return (
    <Dialog open={!!ids} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Dismiss {count === 1 ? "this task" : `${count} tasks`}
          </DialogTitle>
          <DialogDescription>
            Dismissed tasks are closed without being done and won't be created
            again for this booking. The reason is saved on each task.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="space-y-2">
          <legend className="sr-only">Reason</legend>
          {[...DISMISS_REASONS, OTHER].map((r) => (
            <label
              key={r}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm has-[:checked]:border-foreground"
            >
              <input
                type="radio"
                name="dismiss-reason"
                checked={choice === r}
                onChange={() => setChoice(r)}
              />
              {r}
            </label>
          ))}
          {choice === OTHER && (
            <Textarea
              aria-label="Reason"
              value={other}
              onChange={(e) => setOther(e.target.value)}
              maxLength={500}
              placeholder="Why doesn't this need doing?"
            />
          )}
        </fieldset>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={busy || reason.length < 3}
          >
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
