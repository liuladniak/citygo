import React, { useEffect, useState, useCallback } from "react";
import axios from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserCog,
  UserMinus,
  CreditCard,
  XCircle,
  CalendarPlus,
  Loader2,
  Pencil,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ActivityAction =
  | "assignment"
  | "unassignment"
  | "payment"
  | "cancellation"
  | "booking";

interface ActivityLog {
  id: number;
  action: string;
  message: string;
  created_at: string;
  source: "booking" | "tour";
  ref_id: number | null;
  ref_label: string | null;
}

const activityConfig: Record<
  string,
  { icon: React.ReactNode; bg: string; text: string }
> = {
  assignment: {
    icon: <UserCog className="h-3.5 w-3.5" />,
    bg: "bg-blue-100 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-400",
  },
  unassignment: {
    icon: <UserMinus className="h-3.5 w-3.5" />,
    bg: "bg-orange-100 dark:bg-orange-950/40",
    text: "text-orange-600 dark:text-orange-400",
  },
  payment: {
    icon: <CreditCard className="h-3.5 w-3.5" />,
    bg: "bg-green-100 dark:bg-green-950/40",
    text: "text-green-600 dark:text-green-400",
  },
  cancellation: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    bg: "bg-red-100 dark:bg-red-950/40",
    text: "text-red-600 dark:text-red-400",
  },
  booking: {
    icon: <CalendarPlus className="h-3.5 w-3.5" />,
    bg: "bg-purple-100 dark:bg-purple-950/40",
    text: "text-purple-600 dark:text-purple-400",
  },
  edit: {
    icon: <Pencil className="h-3.5 w-3.5" />,
    bg: "bg-amber-100 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-400",
  },
  images: {
    icon: <Pencil className="h-3.5 w-3.5" />,
    bg: "bg-amber-100 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-400",
  },
  schedule: {
    icon: <MapPin className="h-3.5 w-3.5" />,
    bg: "bg-cyan-100 dark:bg-cyan-950/40",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  itinerary: {
    icon: <MapPin className="h-3.5 w-3.5" />,
    bg: "bg-cyan-100 dark:bg-cyan-950/40",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  highlights: {
    icon: <Pencil className="h-3.5 w-3.5" />,
    bg: "bg-amber-100 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-400",
  },
};

const defaultConfig = {
  icon: <CalendarPlus className="h-3.5 w-3.5" />,
  bg: "bg-gray-100 dark:bg-gray-800",
  text: "text-gray-600 dark:text-gray-400",
};

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async (cursorParam?: string) => {
    try {
      const res = await axios.get(`/api/activity`, {
        params: { limit: 5, ...(cursorParam && { cursor: cursorParam }) },
      });
      return res.data;
    } catch (err) {
      console.error("Activity feed error:", err);
      setError("Failed to load activity");
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchActivities();
        setActivities(data.data);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      } catch {
        setError("Failed to load activity");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [fetchActivities]);

  const handleLoadMore = async () => {
    if (!cursor) return;
    setIsLoadingMore(true);
    try {
      const data = await fetchActivities(cursor);
      setActivities((prev) => [...prev, ...data.data]);
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch {
      setError("Failed to load more");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-4">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {activities.map((activity, index) => {
              const config =
                activityConfig[activity.action as ActivityAction] ??
                defaultConfig;
              const isLast = index === activities.length - 1 && !hasMore;
              return (
                <div
                  key={`${activity.id}-${index}`}
                  className="flex items-start gap-3"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center rounded-full p-1.5 ${config.bg} ${config.text}`}
                    >
                      {config.icon}
                    </div>
                    {!isLast && (
                      <div className="w-px h-full min-h-[24px] bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 pt-0.5 pb-2">
                    <p className="text-sm text-foreground leading-snug">
                      {activity.message}
                    </p>

                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.created_at)}
                      {activity.ref_label && (
                        <span className="ml-1 opacity-60">
                          · {activity.ref_label}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground mt-1"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                Load more
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
