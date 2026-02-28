import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Icon from "./ui/SVGIcons/Icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  addPath,
  calenderIconPath,
  clockPath,
  editPath,
  groupIconPath,
  locationIconPath,
  phonePath,
  visibilityPath,
} from "./ui/SVGIcons/iconPaths";
import CustomButton from "./ui/CustomButton/CustomButton";
import { Booking } from "@/types/booking";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { DashboardRange } from "@/types/dashboard";

interface BookingsListProps {
  bookings: Booking[];
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
}

interface RecentBookingCardProps {
  booking: Booking;
  onClick?: () => void;
}

// function formatDate(dateString: string) {
//   const date = new Date(dateString);

//   return date.toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// }

const getStatusStyles = (status: string | null | undefined) => {
  switch (status?.toLowerCase()) {
    case "cancelled":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "cancelled",
      };
    case "pending":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "pending",
      };
    case "confirmed":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "confirmed",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "unknown",
      };
  }
};
// const formatTime = (timeStr: string | null | undefined): string => {
//   if (!timeStr) return "TBD";
//   const [hours, minutes] = timeStr.split(":");
//   const h = parseInt(hours);
//   if (isNaN(h)) return "TBD";
//   const ampm = h >= 12 ? "PM" : "AM";
//   return `${h % 12 || 12}:${minutes} ${ampm}`;
// };

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

  return (
    <Card
      onClick={onClick}
      className="flex items-center justify-between hover:bg-muted/30 transition-colors"
    >
      <CardContent className="flex flex-col gap-2 p-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-medium">
              {booking.primary_contact_name || "Unnamed Contact"}
            </CardTitle>
            <Badge
              variant="secondary"
              className={`${statusStyles.bg} ${statusStyles.text} text-xs font-semibold`}
            >
              {statusStyles.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {booking.booking_reference}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
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

        <CardDescription>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon iconPath={locationIconPath} />
              {booking.is_custom_tour ? "Custom tour" : booking.tour_name}
            </div>
            <div className="flex items-center gap-1">
              <Icon iconPath={calenderIconPath} />
              {/* {formatDate(booking.booking_date)} */}
              {booking.booking_date}
            </div>
            <div className="flex items-center gap-1">
              <Icon iconPath={clockPath} />
              {/* {booking.is_custom_tour
                ? `${formatTime(booking.start_time)} - ${formatTime(
                    booking.end_time
                  )}`
                : `${formatTime(booking.display_start_time)} - ${formatTime(
                    booking.display_end_time
                  )}`} */}
              {booking.is_custom_tour
                ? `${booking.start_time} - ${booking.end_time}`
                : `${booking.display_start_time} - ${booking.display_end_time}`}
            </div>
            <div className="flex items-center gap-1">
              <Icon iconPath={groupIconPath} />
              <span>{booking.total_guests}</span>
            </div>
          </div>
        </CardDescription>

        <div className="flex items-center gap-6 text-sm mt-2">
          <span className="text-muted-foreground">
            Guide:{" "}
            <span className="font-medium text-foreground">
              {booking.guide_name}
            </span>
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid:&nbsp;</span>
              <span className="font-medium">
                ${Number(booking.amount_paid).toFixed(2)}
              </span>
            </div>

            {balance > 0 && (
              <div className="flex justify-between text-xs text-red-500">
                <span>Balance Due:&nbsp;</span>
                <span> ${balance.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
