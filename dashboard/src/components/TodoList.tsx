import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TaskDetailModal from "./modals/TaskDetailModal";

export default function TodoList() {
  const { user } = useAuth();
  const { role } = useRole(user?.id);
  const { employee } = useEmployee();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const isManager = role === "admin" || role === "manager";

  const { data: tasks = [] } = useQuery<any[]>({
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
      const { data } = await axios.get(`/api/tasks`, { params });
      return data.sort((a: any, b: any) => {
        if (a.priority === "urgent" && b.priority !== "urgent") return -1;
        if (b.priority === "urgent" && a.priority !== "urgent") return 1;
        return 0;
      });
    },
    enabled: !!employee,
  });

  const urgentCount = tasks.filter((t) => t.priority === "urgent").length;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold">Tasks</h1>
          {urgentCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-full px-2 py-0.5">
              <AlertTriangle className="h-3 w-3" />
              {urgentCount} urgent
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground h-7 px-2 hover:text-foreground"
          onClick={() => navigate("/tasks")}
        >
          View all
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">All caught up!</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[320px]">
          <div className="flex flex-col">
            {tasks.map((task, i) => {
              const isOverdue =
                task.due_date && new Date(task.due_date) < new Date();
              const isUrgent = task.priority === "urgent";

              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left w-full group ${
                    i < tasks.length - 1 ? "border-b border-border/50" : ""
                  }`}
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      isUrgent ? "bg-red-500" : "bg-muted-foreground/30"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate leading-snug ${
                        isUrgent
                          ? "font-medium text-foreground"
                          : "text-foreground/80"
                      }`}
                    >
                      {task.title.replace(/^\[auto_\w+\]\s*/, "")}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.booking_reference && (
                        <span className="text-xs text-muted-foreground">
                          {task.booking_reference}
                        </span>
                      )}
                      {isOverdue && (
                        <span className="text-xs text-red-500 font-medium">
                          Overdue
                        </span>
                      )}
                      {!isOverdue && task.due_date && (
                        <span className="text-xs text-muted-foreground">
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </button>
              );
            })}
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
    </div>
  );
}
