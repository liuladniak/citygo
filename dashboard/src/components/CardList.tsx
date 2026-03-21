import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatTime } from "@/lib/utils";
import Icon from "./ui/SVGIcons/Icon";
import {
  addPath,
  editPath,
  phonePath,
  visibilityPath,
} from "./ui/SVGIcons/iconPaths";
import CustomButton from "./ui/CustomButton/CustomButton";
import type { Booking } from "@/types/booking";
import type { DashboardRange } from "@/types/dashboard";

interface BookingsListProps {
  bookings: Booking[];
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
}

interface RecentBookingCardProps {
  booking: Booking;
  onClick?: () => void;
}

const getStatusStyles = (status: string | null | undefined) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "confirmed",
      };

    case "pending":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "pending",
      };
    case "draft":
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        label: "Draft",
      };
    case "completed":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Completed",
      };
    case "cancelled":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "cancelled",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "unknown",
      };
  }
};

const CardList = ({ bookings, range, onRangeChange }: BookingsListProps) => {
  const navigate = useNavigate();
  return (
    <Card className="py-6 flex-3">
      <CardHeader className="flex justify-between px-6">
        <CardTitle>Latest Bookings</CardTitle>
        <div className="flex items-center gap-3">
          <Select value={range} onValueChange={onRangeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">All Upcoming</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
          <CustomButton to="/booking/add" IconPath={addPath} className="flex">
            New Booking
          </CustomButton>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-2 px-4">
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No bookings for this period.
          </p>
        ) : (
          bookings.map((item) => (
            <RecentBookingCard
              key={item.id}
              booking={item}
              onClick={() => navigate(`/bookings/${item.id}`)}
            />
          ))
        )}
      </div>
      <div className="px-6 pt-4 mt-2 border-t">
        <Button
          variant="ghost"
          className="w-full text-sm text-muted-foreground"
          onClick={() => navigate("/bookings")}
        >
          View all bookings →
        </Button>
      </div>
    </Card>
  );
};

export default CardList;

export function RecentBookingCard({
  booking,
  onClick,
}: RecentBookingCardProps) {
  const statusStyles = getStatusStyles(booking.status);
  const balance = Number(booking.total_price) - Number(booking.amount_paid);
  const timeDisplay = booking.is_custom_tour
    ? `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`
    : `${formatTime(booking.display_start_time)} – ${formatTime(
        booking.display_end_time
      )}`;

  const accentColor: Record<string, string> = {
    confirmed: "border-l-green-500",
    pending: "border-l-yellow-400",
    draft: "border-l-gray-300",
    completed: "border-l-blue-400",
    cancelled: "border-l-red-400",
  };

  const accent =
    accentColor[booking.status?.toLowerCase() ?? ""] ?? "border-l-gray-200";

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-4 rounded-lg border border-border border-l-4 ${accent} bg-card hover:bg-muted/30 transition-colors cursor-pointer shadow-sm group`}
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-base font-semibold truncate">
            {booking.primary_contact_name || "Unnamed"}
          </span>
          <Badge
            variant="secondary"
            className={`${statusStyles.bg} ${statusStyles.text} text-xs px-2 py-0.5 font-medium shrink-0`}
          >
            {statusStyles.label}
          </Badge>
          <span className="text-xs text-muted-foreground shrink-0">
            {booking.booking_reference}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span className="font-medium text-foreground">
            {booking.is_custom_tour ? "Custom Tour" : booking.tour_name}
          </span>
          <span>·</span>
          <span>{formatDate(booking.tour_date)}</span>
          <span>·</span>
          <span>{timeDisplay}</span>
          <span>·</span>
          <span>{booking.total_guests} guests</span>
        </div>

        <div className="text-sm text-muted-foreground">
          Staff:{" "}
          {booking.staff && booking.staff.length > 0 ? (
            <span className="inline-flex flex-wrap gap-x-2">
              {booking.staff.map((s) => (
                <span key={s.guide_id} className="font-medium text-foreground">
                  {s.guide_name}
                  <span className="text-muted-foreground font-normal ml-1 text-xs capitalize">
                    ({s.role.replace("_", " ")})
                  </span>
                </span>
              ))}
            </span>
          ) : (
            <span className="font-medium text-orange-500">Unassigned</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 ml-6">
        <div className="text-right">
          <p className="text-sm font-semibold">
            €{Number(booking.amount_paid).toFixed(2)}
            <span className="text-xs text-muted-foreground font-normal ml-1">
              paid
            </span>
          </p>
          {balance > 0 ? (
            <p className="text-xs text-red-500 mt-0.5">
              €{balance.toFixed(2)} due
            </p>
          ) : (
            <p className="text-xs text-emerald-500 mt-0.5">Paid in full</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Icon iconPath={visibilityPath} /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Icon iconPath={editPath} /> Edit Booking
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Icon iconPath={phonePath} /> Contact Client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
