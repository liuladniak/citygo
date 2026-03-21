import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { useRole } from "@/hooks/useRole";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
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

interface Task {
  id: number;
  title: string;
  description: string | null;
  type: string;
  booking_id: number | null;
  assigned_to: number | null;
  created_by: number | null;
  priority: "urgent" | "normal" | "low";
  status: "open" | "in_progress" | "done" | "cancelled";
  due_date: string | null;
  is_auto_generated: boolean;
  assignee_name: string | null;
  creator_name: string | null;
  booking_reference: string | null;
  completed_at: string | null;
}

function TaskRow({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  const isDone = task.status === "done";
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "done";
  const isUrgent = task.priority === "urgent";

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/40 transition-colors group cursor-pointer ${
        isDone ? "opacity-50" : ""
      }`}
    >
      <div
        className={`h-2 w-2 rounded-full shrink-0 ${
          isDone
            ? "bg-emerald-500"
            : task.status === "in_progress"
            ? "bg-blue-500"
            : isUrgent
            ? "bg-red-500"
            : "bg-muted-foreground/30"
        }`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm truncate ${
              isDone ? "line-through text-muted-foreground" : "font-medium"
            }`}
          >
            {task.title.replace(/^\[auto_\w+\]\s*/, "")}
          </p>
          {task.is_auto_generated && (
            <span className="text-[10px] text-muted-foreground border border-border rounded px-1 py-0 shrink-0">
              auto
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.booking_reference && (
            <span className="text-xs text-muted-foreground">
              {task.booking_reference}
            </span>
          )}
          {task.assignee_name && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.assignee_name}
            </span>
          )}
          {task.due_date && (
            <span
              className={`text-xs flex items-center gap-1 ${
                isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"
              }`}
            >
              {isOverdue ? "Overdue · " : ""}
              {formatDate(task.due_date)}
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
      const { data } = await axios.get(`/api/tasks`, { params });
      return data;
    },
    enabled: !!employee,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      axios.patch(`/api/tasks/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const filtered = tasks.filter((t) =>
    search
      ? t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.booking_reference?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const urgent = filtered.filter(
    (t) =>
      t.priority === "urgent" && t.status !== "done" && t.status !== "cancelled"
  );
  const normal = filtered.filter(
    (t) =>
      t.priority !== "urgent" && t.status !== "done" && t.status !== "cancelled"
  );
  const done = filtered.filter((t) => t.status === "done");

  const counts = {
    open: tasks.filter((t) => t.status === "open").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    urgent: tasks.filter((t) => t.priority === "urgent" && t.status !== "done")
      .length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isManager ? "All team tasks" : "Your assigned tasks"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
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
            color: "text-blue-500",
          },
          {
            label: "Completed Today",
            value: counts.done,
            color: "text-emerald-500",
          },
          { label: "Urgent", value: counts.urgent, color: "text-red-500" },
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
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Urgent · {urgent.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                {urgent.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    onStatusChange={(id, status) =>
                      updateStatus({ id, status })
                    }
                  />
                ))}
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
                {normal.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    onStatusChange={(id, status) =>
                      updateStatus({ id, status })
                    }
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {done.length > 0 && (
            <Card className="opacity-70">
              <CardHeader className="pb-0 pt-3 px-4">
                <CardTitle className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed Today ({done.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                {done.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    onStatusChange={(id, status) =>
                      updateStatus({ id, status })
                    }
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

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
    </div>
  );
}
