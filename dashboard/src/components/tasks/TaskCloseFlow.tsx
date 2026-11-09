import type { CloseTasksFlow } from "@/hooks/useCloseTasks";
import { CloseTasksDialog } from "./CloseTasksDialog";
import { DismissTasksDialog } from "./DismissTasksDialog";

export function TaskCloseFlow({ flow }: { flow: CloseTasksFlow }) {
  return (
    <>
      <CloseTasksDialog
        plan={flow.plan}
        canDismiss={flow.canDismiss}
        busy={flow.busy}
        onCloseReady={flow.closeReady}
        onDismiss={flow.dismissUnresolved}
        onCancel={flow.cancel}
      />
      <DismissTasksDialog
        ids={flow.dismissIds}
        busy={flow.busy}
        onConfirm={flow.confirmDismiss}
        onCancel={flow.cancel}
      />
    </>
  );
}
