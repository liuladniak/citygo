import { useEffect, useState } from "react";
import axios from "@/lib/apiClient";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Send,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const priorityConfig = {
  urgent: { label: "Urgent", class: "bg-red-100 text-red-700 border-red-200" },
  normal: {
    label: "Normal",
    class: "bg-blue-100 text-blue-700 border-blue-200",
  },
  low: { label: "Low", class: "bg-gray-100 text-gray-600 border-gray-200" },
};

interface Props {
  open: boolean;
  onClose: () => void;
  task: any;
  currentEmployeeId: number | null;
  isManager: boolean;
  onSuccess: () => void;
}

export default function TaskDetailModal({
  open,
  onClose,
  task,
  currentEmployeeId,
  isManager,
  onSuccess,
}: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!open || !task) return;
    setNewComment("");
    setPendingAction(null);
    axios.get(`/api/tasks/${task.id}`).then((res) => {
      setComments(res.data.comments ?? []);
    });

    if (isManager) {
      axios.get(`/api/employees`).then((res) => {
        setEmployees(res.data.data ?? res.data);
      });
    }
  }, [open, task?.id]);

  const handleStatusChange = async (status: string) => {
    setIsUpdatingStatus(true);
    try {
      await axios.patch(`/api/tasks/${task.id}`, {
        status,
        completed_by: status === "done" ? currentEmployeeId : null,
      });
      onSuccess();
      onClose();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReassign = async (assignedTo: string) => {
    await axios.patch(`/api/tasks/${task.id}`, {
      assigned_to: assignedTo === "unassigned" ? null : assignedTo,
    });
    onSuccess();
  };
  const handleComment = async () => {
    if (!newComment.trim()) return;
    setIsPostingComment(true);
    try {
      const { data } = await axios.post(`/api/tasks/${task.id}/comments`, {
        content: newComment,
        author_id: currentEmployeeId,
      });
      setComments((p) => [...p, data]);
      setNewComment("");
    } finally {
      setIsPostingComment(false);
    }
  };

  if (!task) return null;

  const isDone = task.status === "done";
  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && !isDone;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-6 leading-snug">
            {task.title.replace(/^\[auto_\w+\]\s*/, "")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={
                priorityConfig[task.priority as keyof typeof priorityConfig]
                  ?.class
              }
            >
              {
                priorityConfig[task.priority as keyof typeof priorityConfig]
                  ?.label
              }
            </Badge>
            {task.is_auto_generated && (
              <Badge variant="outline" className="text-muted-foreground">
                Auto-generated
              </Badge>
            )}
            {task.booking_reference && (
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200 bg-blue-50"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                {task.booking_reference}
              </Badge>
            )}
          </div>
          {task.booking_id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                navigate(`/bookings/${task.booking_id}`);
              }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Booking {task.booking_reference ?? ""}
            </Button>
          )}

          {task.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {task.assignee_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span>{task.assignee_name}</span>
              </div>
            )}
            {task.due_date && (
              <div
                className={`flex items-center gap-2 ${
                  isOverdue ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {isOverdue ? "Overdue · " : ""}
                  {formatDate(task.due_date)}
                </span>
              </div>
            )}
            {task.creator_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-3.5 w-3.5 shrink-0" />
                <span>Created by {task.creator_name}</span>
              </div>
            )}
          </div>

          {pendingAction ? (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted text-sm">
              <span className="text-muted-foreground flex-1">
                {pendingAction === "done" && "Mark this task as done?"}
                {pendingAction === "in_progress" && "Mark as in progress?"}
                {pendingAction === "open" && "Reopen this task?"}
                {pendingAction === "cancelled" && "Cancel this task?"}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPendingAction(null)}
              >
                No
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleStatusChange(pendingAction);
                  setPendingAction(null);
                }}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Yes, confirm"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {task.status !== "done" && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setPendingAction("done")}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Done
                </Button>
              )}
              {task.status === "open" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingAction("in_progress")}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}
              {task.status === "done" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingAction("open")}
                >
                  <Circle className="h-4 w-4 mr-2" />
                  Reopen
                </Button>
              )}
              {isManager && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive ml-auto"
                  onClick={() => setPendingAction("cancelled")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {isManager && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Reassign
              </p>
              <Select
                value={task.assigned_to ? String(task.assigned_to) : ""}
                onValueChange={handleReassign}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.first_name} {e.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Comments {comments.length > 0 && `(${comments.length})`}
            </p>

            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                      {c.author_name?.charAt(0) ?? "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">
                          {c.author_name ?? "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mt-0.5 text-muted-foreground">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none min-h-[60px] text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.metaKey) handleComment();
                }}
              />
              <Button
                size="icon"
                onClick={handleComment}
                disabled={isPostingComment || !newComment.trim()}
                className="shrink-0 self-end"
              >
                {isPostingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">⌘ + Enter to submit</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
