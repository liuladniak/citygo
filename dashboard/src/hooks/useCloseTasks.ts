import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import type { ClosePlan, CloseResult } from "@/lib/tasks";

type Action = "done" | "dismiss" | "reopen";

const tasksLabel = (n: number) => `${n} task${n === 1 ? "" : "s"}`;
const skippedNote = (s: ClosePlan["skipped"]) =>
  s.length === 0
    ? ""
    : s.length === 1
      ? ` · 1 skipped (${s[0].reason})`
      : ` · ${s.length} skipped`;

export function useCloseTasks({ onClosed }: { onClosed?: () => void } = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { role } = useRole(user?.id);
  const canDismiss = role === "admin" || role === "manager";

  const [plan, setPlan] = useState<ClosePlan | null>(null);
  const [dismissIds, setDismissIds] = useState<number[] | null>(null);
  const [checking, setChecking] = useState(false);

  const close = useMutation({
    mutationFn: async (body: {
      ids: number[];
      action: Action;
      reason?: string;
    }) => {
      const { data } = await axios.post<CloseResult>(
        "/api/tasks/bulk-close",
        body,
      );
      return data;
    },
    onSuccess: (res, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks-widget"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setPlan(null);
      setDismissIds(null);

      if (action === "reopen") {
        toast.success(`${tasksLabel(res.updated.length)} reopened`);
        return;
      }
      // Something changed between preview and close (N6): show the dialog again
      if (action === "done" && res.unresolved.length > 0) {
        setPlan({
          ready: [],
          unresolved: res.unresolved,
          skipped: res.skipped,
        });
      }
      if (res.updated.length === 0) {
        if (res.unresolved.length === 0)
          toast.info(`Nothing was closed${skippedNote(res.skipped)}`);
        return;
      }
      const verb = action === "done" ? "marked done" : "dismissed";
      toast.success(
        `${tasksLabel(res.updated.length)} ${verb}${skippedNote(res.skipped)}`,
        {
          action: {
            label: "Undo",
            onClick: () => close.mutate({ ids: res.updated, action: "reopen" }),
          },
        },
      );
      onClosed?.();
    },
    onError: () => toast.error("Couldn't update tasks. Try again."),
  });

  const markDone = async (ids: number[]) => {
    if (ids.length === 0) return;
    setChecking(true);
    try {
      const { data } = await axios.post<ClosePlan>(
        "/api/tasks/bulk-close/preview",
        { ids },
      );
      if (data.unresolved.length > 0)
        setPlan(data); // F6: ask
      else if (data.ready.length > 0)
        close.mutate({ ids: data.ready, action: "done" }); // F5: fast path
      else toast.info(`Nothing to close${skippedNote(data.skipped)}`);
    } catch {
      toast.error("Couldn't check these tasks. Try again.");
    } finally {
      setChecking(false);
    }
  };

  return {
    canDismiss,
    busy: checking || close.isPending,
    plan,
    dismissIds,
    markDone,
    dismiss: (ids: number[]) => setDismissIds(ids),
    closeReady: () => plan && close.mutate({ ids: plan.ready, action: "done" }),
    dismissUnresolved: () => {
      if (!plan) return;
      setDismissIds(plan.unresolved.map((u) => u.id));
      setPlan(null);
    },
    confirmDismiss: (reason: string) =>
      dismissIds &&
      close.mutate({ ids: dismissIds, action: "dismiss", reason }),
    cancel: () => {
      setPlan(null);
      setDismissIds(null);
    },
  };
}

export type CloseTasksFlow = ReturnType<typeof useCloseTasks>;
