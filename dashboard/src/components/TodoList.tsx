import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { format, isBefore, startOfToday } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { useRole } from "@/hooks/useRole";
import { useSelection } from "@/hooks/useSelection";
import { useCloseTasks } from "@/hooks/useCloseTasks";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectionToolbar } from "@/components/selection/SelectionToolbar";
import { TaskCheckbox } from "@/components/tasks/TaskCheckbox";
import { TaskCloseFlow } from "@/components/tasks/TaskCloseFlow";
import {
  autoTaskKind,
  cleanTaskTitle,
  isTaskSelectable,
  type Task,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";
import TaskDetailModal from "./modals/TaskDetailModal";

const isOverdue = (t: Task) =>
  !!t.due_date && isBefore(new Date(t.due_date), startOfToday());

export default function TodoList() {
  const { user } = useAuth();
  const { role } = useRole(user?.id);
  const { employee } = useEmployee();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const isManager = role === "admin" || role === "manager";

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks-widget", employee?.id, isManager],
    queryFn: async () => {
      const params: Record<string, string> = {
        status: "open",
        limit: "5",
      };
      if (!isManager && employee?.id) {
        params.assigned_to = String(employee.id);
        params.include_unassigned = "true";
      }
      const { data } = await axios.get<Task[]>(`/api/tasks`, { params });
      return data.sort((a, b) => {
        if (a.priority === "urgent" && b.priority !== "urgent") return -1;
        if (b.priority === "urgent" && a.priority !== "urgent") return 1;
        return 0;
      });
    },
    enabled: !!employee,
  });

  const sel = useSelection(tasks, {
    getId: (t) => t.id,
    canSelect: isTaskSelectable,
  });
  const flow = useCloseTasks();
  const autoSelected = tasks.filter(
    (t) => sel.isSelected(t.id) && t.is_auto_generated,
  ).length;

  const overdue = tasks.filter(isOverdue);
  const upcoming = tasks.filter((t) => !isOverdue(t));

  const openAction = (task: Task) => {
    if (autoTaskKind(task.title) === "auto_assign_guide" && task.booking_id) {
      navigate(`/bookings/${task.booking_id}`);
    } else {
      setSelectedTask(task);
    }
  };

  const renderTask = (task: Task, variant: "overdue" | "upcoming") => (
    <div
      key={task.id}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-1.5",
        variant === "overdue"
          ? "border border-red-100 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/30"
          : "border-b border-border/50 last:border-b-0",
      )}
    >
      <TaskCheckbox
        task={task}
        checked={sel.isSelected(task.id)}
        onToggle={() => sel.toggle(task.id)}
      />
      <button
        type="button"
        onClick={() => setSelectedTask(task)}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={cn(
            "truncate text-sm",
            variant === "overdue" ? "font-semibold" : "text-foreground/90",
          )}
        >
          {cleanTaskTitle(task.title)}
        </p>
        <p className="text-xs text-muted-foreground">
          {task.booking_reference && (
            <span className="font-mono">{task.booking_reference}</span>
          )}
          {task.booking_reference && task.due_date && " · "}
          {task.due_date &&
            (variant === "overdue"
              ? `Overdue since ${format(new Date(task.due_date), "d MMM")}`
              : `Due ${format(new Date(task.due_date), "d MMM")}`)}
        </p>
      </button>
      {variant === "overdue" && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 shrink-0 bg-background"
          onClick={() => openAction(task)}
        >
          {autoTaskKind(task.title) === "auto_assign_guide"
            ? "Assign"
            : "Review"}
        </Button>
      )}
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <SelectionToolbar
        className="mb-3"
        state={sel.headerState}
        onToggleAll={sel.toggleAll}
        disabled={!sel.canSelectAny}
        count={sel.count}
        onClear={sel.clear}
        title={<h2 className="text-base font-semibold">To do</h2>}
        trailing={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/tasks")}
          >
            All tasks
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        }
        actions={
          <>
            {flow.canDismiss && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => flow.dismiss(sel.selectedIds)}
                disabled={flow.busy}
              >
                Dismiss
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => flow.markDone(sel.selectedIds)}
              disabled={flow.busy}
            >
              Mark done
            </Button>
          </>
        }
        note={
          autoSelected > 0 &&
          `${autoSelected} automatic ${
            autoSelected === 1 ? "check" : "checks"
          } will be verified before closing.`
        }
      />

      {tasks.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 opacity-20" />
          <p className="text-sm">All caught up!</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[360px]">
          <div className="flex flex-col gap-4">
            {overdue.length > 0 && (
              <section
                aria-label="Overdue tasks"
                className="flex flex-col gap-2"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                  Overdue · {overdue.length}
                </h3>
                {overdue.map((t) => renderTask(t, "overdue"))}
              </section>
            )}
            {upcoming.length > 0 && (
              <section aria-label="Upcoming tasks" className="flex flex-col">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Upcoming · {upcoming.length}
                </h3>
                {upcoming.map((t) => renderTask(t, "upcoming"))}
              </section>
            )}
          </div>
        </ScrollArea>
      )}

      <TaskDetailModal
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        currentEmployeeId={employee?.id ?? null}
        isManager={isManager}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["tasks-widget"] });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          setSelectedTask(null);
        }}
      />
      <TaskCloseFlow flow={flow} />
    </div>
  );
}
