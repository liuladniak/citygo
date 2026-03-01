import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, CreditCard, XCircle } from "lucide-react";

type ActivityType = "assignment" | "payment" | "cancellation";

interface Activity {
  id: number;
  type: ActivityType;
  message: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: 1,
    type: "assignment",
    message:
      "Alex Walker assigned Tom Anderson to Bosphorus Cruise and Spice Market Tour",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "payment",
    message: "Payment of $220 received from Mike Adams",
    time: "1 day ago",
  },
  {
    id: 3,
    type: "cancellation",
    message: "Booking #BK-1031 was cancelled by Jane Smith",
    time: "2 days ago",
  },
];

const activityConfig: Record<
  ActivityType,
  {
    icon: React.ReactNode;
    bg: string;
    text: string;
  }
> = {
  assignment: {
    icon: <UserCog className="h-3.5 w-3.5" />,
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  payment: {
    icon: <CreditCard className="h-3.5 w-3.5" />,
    bg: "bg-green-100",
    text: "text-green-600",
  },
  cancellation: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    bg: "bg-red-100",
    text: "text-red-600",
  },
};

function getInitials(message: string): string {
  const words = message.trim().split(" ");
  return words.length >= 2
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : words[0][0].toUpperCase();
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-4">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-3">
                {/* timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center rounded-full p-1.5 ${config.bg} ${config.text}`}
                  >
                    {config.icon}
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-px h-full min-h-[24px] bg-border mt-1" />
                  )}
                </div>

                {/* content */}
                <div className="flex flex-col gap-0.5 pt-0.5 pb-2">
                  <p className="text-sm text-foreground leading-snug">
                    {activity.message}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
