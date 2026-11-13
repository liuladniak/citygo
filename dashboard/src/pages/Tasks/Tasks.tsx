import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { useRole } from "@/hooks/useRole";
import { useSelection } from "@/hooks/useSelection";
import { useCloseTasks } from "@/hooks/useCloseTasks";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  User,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import { BulkActionBar } from "@/components/selection/BulkActionBar";
import { SelectAllCheckbox } from "@/components/selection/SelectAllCheckbox";
import { TaskCheckbox } from "@/components/tasks/TaskCheckbox";
import { TaskCloseFlow } from "@/components/tasks/TaskCloseFlow";
import { cleanTaskTitle, isTaskSelectable, type Task } from "@/lib/tasks";

function TaskRow({
  task,
  onClick,
  selectable,
  checked,
  onToggle,
}: {
  task: Task;
  onClick: () => void;
  selectable: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  const isDone = task.status === "done";
  const isDismissed = task.status === "dismissed";
  const isClosed = isDone || isDismissed;
  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && !isClosed;
  const isUrgent = task.priority === "urgent";
  const closedBySystem =
    isClosed && task.is_auto_generated && task.completed_by === null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2 border-b last:border-0 hover:bg-muted/40 transition-colors group cursor-pointer",
        isClosed && "opacity-60",
        checked && "bg-muted/60",
      )}
    >
      {/* Checkbox for open tasks; same-width spacer for closed ones so titles line up */}
      {selectable ? (
        <TaskCheckbox task={task} checked={checked} onToggle={onToggle} />
      ) : (
        <span className="-ml-2 w-11 shrink-0" aria-hidden="true" />
      )}

      <div
        className={cn(
          "h-2 w-2 rounded-full shrink-0",
          isDone
            ? "bg-emerald-500"
            : isDismissed
              ? "bg-muted-foreground/40"
              : task.status === "in_progress"
                ? "bg-blue-500"
                : isUrgent
                  ? "bg-red-500"
                  : "bg-muted-foreground/30",
        )}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm truncate",
              isClosed ? "line-through text-muted-foreground" : "font-medium",
            )}
          >
            {cleanTaskTitle(task.title)}
          </p>
          {task.is_auto_generated && (
            <span className="text-[10px] text-muted-foreground border border-border rounded px-1 py-0 shrink-0">
              auto
            </span>
          )}
          {isDismissed && (
            <span className="text-[10px] text-muted-foreground border border-border rounded px-1 py-0 shrink-0">
              dismissed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.booking_reference && (
            <span className="font-mono text-xs text-muted-foreground">
              {task.booking_reference}
            </span>
          )}
          {task.assignee_name && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.assignee_name}
            </span>
          )}
          {task.due_date && !isClosed && (
            <span
              className={cn(
                "text-xs flex items-center gap-1",
                isOverdue
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : "text-muted-foreground",
              )}
            >
              {isOverdue ? "Overdue · " : ""}
              {formatDate(task.due_date)}
            </span>
          )}
          {closedBySystem && (
            <span className="text-xs text-muted-foreground">
              Closed by System
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}

export default function TasksPage() {
  const { user } = useAuth();
  const { role } = useRole(user?.id);
  const { employee } = useEmployee();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("open");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const isManager = role === "admin" || role === "manager";

  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery<Task[]>({
    queryKey: ["tasks", statusFilter, priorityFilter, assigneeFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;
      if (assigneeFilter !== "all" && assigneeFilter !== "mine") {
        params.assigned_to = assigneeFilter;
      }
      if (assigneeFilter === "mine" && employee?.id) {
        params.assigned_to = String(employee.id);
        params.include_unassigned = "true";
      }
      const { data } = await axios.get<Task[]>(`/api/tasks`, { params });
      return data;
    },
    enabled: !!employee,
  });

  const filtered = tasks.filter((t) =>
    search
      ? t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.booking_reference?.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const sel = useSelection(filtered, {
    getId: (t) => t.id,
    canSelect: isTaskSelectable,
  });
  const flow = useCloseTasks();
  const selectableCount = filtered.filter(isTaskSelectable).length;
  const autoSelected = filtered.filter(
    (t) => sel.isSelected(t.id) && t.is_auto_generated,
  ).length;

  const urgent = filtered.filter(
    (t) => isTaskSelectable(t) && t.priority === "urgent",
  );
  const normal = filtered.filter(
    (t) => isTaskSelectable(t) && t.priority !== "urgent",
  );
  const done = filtered.filter((t) => t.status === "done");
  const dismissed = filtered.filter((t) => t.status === "dismissed");

  const counts = {
    open: tasks.filter((t) => t.status === "open").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    urgent: tasks.filter((t) => t.priority === "urgent" && isTaskSelectable(t))
      .length,
  };

  const renderRow = (task: Task) => (
    <TaskRow
      key={task.id}
      task={task}
      onClick={() => setSelectedTask(task)}
      selectable={isTaskSelectable(task)}
      checked={sel.isSelected(task.id)}
      onToggle={() => sel.toggle(task.id)}
    />
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-description">
            {isManager ? "All team tasks" : "Your assigned tasks"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            aria-label="Refresh tasks"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {isManager && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open", value: counts.open, color: "text-foreground" },
          {
            label: "In Progress",
            value: counts.in_progress,
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Completed Today",
            value: counts.done,
            color: "text-emerald-700 dark:text-emerald-400",
          },
          { label: "Urgent", value: counts.urgent, color: "text-red-600 dark:text-red-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-48"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        {isManager && (
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              <SelectItem value="mine">Mine</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Select all: only shown when something on screen can be ticked */}
        {selectableCount > 0 && (
          <div className="ml-auto">
            <SelectAllCheckbox
              label={`Select all (${selectableCount})`}
              state={sel.headerState}
              onToggle={sel.toggleAll}
              disabled={!sel.canSelectAny}
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No tasks found</p>
          <p className="text-sm mt-1">
            {search ? "Try a different search" : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {urgent.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-0 pt-3 px-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Urgent · {urgent.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                {urgent.map(renderRow)}
              </CardContent>
            </Card>
          )}

          {normal.length > 0 && (
            <Card>
              <CardHeader className="pb-0 pt-3 px-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Normal · {normal.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                {normal.map(renderRow)}
              </CardContent>
            </Card>
          )}

          {done.length > 0 && (
            <Card className="opacity-70">
              <CardHeader className="pb-0 pt-3 px-4">
                <CardTitle className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Done · {done.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                {done.map(renderRow)}
              </CardContent>
            </Card>
          )}

          {dismissed.length > 0 && (
            <Card className="opacity-70">
              <CardHeader className="pb-0 pt-3 px-4">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Ban className="h-4 w-4" />
                  Dismissed · {dismissed.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                {dismissed.map(renderRow)}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Bulk bar: sticks to the bottom of the screen while anything is selected */}
      <BulkActionBar
        className="sticky bottom-4 z-10 mx-auto max-w-xl"
        count={sel.count}
        onClear={sel.clear}
        note={
          autoSelected > 0 &&
          `${autoSelected} automatic ${
            autoSelected === 1 ? "check" : "checks"
          } will be verified before closing.`
        }
      >
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
      </BulkActionBar>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        createdBy={employee?.id ?? null}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })}
      />

      <TaskDetailModal
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        currentEmployeeId={employee?.id ?? null}
        isManager={isManager}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })}
      />

      <TaskCloseFlow flow={flow} />
    </div>
  );
}
