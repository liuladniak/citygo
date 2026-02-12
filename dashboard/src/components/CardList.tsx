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

interface BookingsListProps {
  bookings: Booking[];
}

interface RecentBookingCardProps {
  booking: Booking;
}

const latestBookings = [
  {
    title: "Johnson Family",
    status: "confirmed",
    bookingNumber: "BK-2024-0156",
    tourName: "Golden Gate Bridge & Alcatraz",
    tourDate: "Wed, Jul 17",
    tourTime: "09:00 AM",
    tourGuestsAmount: "4 guests",
    guide: "Sarah Johnson",
    tourPrice: "$480",
  },
  {
    title: "Mike & Rachel Chen",
    status: "pending",
    bookingNumber: "BK-2024-0157",
    tourName: "Fisherman's Wharf Food Tour",
    tourDate: "Wed, Jul 17",
    tourTime: "11:30 AM",
    tourGuestsAmount: "2 guests",
    guide: "David Park",
    tourPrice: "$180",
  },
  {
    title: "Thompson Group",
    status: "confirmed",
    bookingNumber: "BK-2024-0158",
    tourName: "City Highlights Tour",
    tourDate: "Thu, Jul 18",
    tourTime: "02:00 PM",
    tourGuestsAmount: "8 guests",
    guide: "Emma Wilson",
    tourPrice: "$640",
  },
  {
    title: "Rodriguez Wedding Party",
    status: "confirmed",
    bookingNumber: "BK-2024-0159",
    tourName: "Private Sunset Tour",
    tourDate: "Fri, Jul 19",
    tourTime: "06:00 PM",
    tourGuestsAmount: "12 guests",
    guide: "Lisa Rodriguez",
    tourPrice: "$1,200",
  },
];
function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
const formatTime = (timeStr: string | null | undefined): string => {
  if (!timeStr) return "TBD";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours);
  if (isNaN(h)) return "TBD";
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${minutes} ${ampm}`;
};

const CardList = ({ bookings }: BookingsListProps) => {
  return (
    <Card className="py-6">
      <CardHeader className="flex justify-between px-6">
        <CardTitle>Latest Bookings</CardTitle>
        <CustomButton to="/booking/add" IconPath={addPath} className="flex">
          New Booking
        </CustomButton>
      </CardHeader>
      <div className="flex flex-col gap-2 px-4">
        {bookings.map((item, i) => (
          <RecentBookingCard key={item.id} booking={item} />
        ))}
      </div>
    </Card>
  );
};

export default CardList;

export function RecentBookingCard({ booking }: RecentBookingCardProps) {
  const statusStyles = getStatusStyles(status);
  const balance = Number(booking.total_price) - Number(booking.amount_paid);

  return (
    <Card className="flex items-center justify-between hover:bg-muted/30 transition-colors">
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
              {formatDate(booking.booking_date)}
            </div>
            <div className="flex items-center gap-1">
              <Icon iconPath={clockPath} />
              {booking.is_custom_tour
                ? `${formatTime(booking.start_time)} - ${formatTime(
                    booking.end_time
                  )}`
                : `${formatTime(booking.display_start_time)} - ${formatTime(
                    booking.display_end_time
                  )}`}
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
