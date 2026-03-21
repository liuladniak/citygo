import { useNavigate } from "react-router-dom";
import { CheckCircle, Copy, ExternalLink, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Booking } from "@/types/booking";

type ActionsCellProps = {
  booking: Booking;
};

export function ActionsCell({ booking }: ActionsCellProps) {
  const navigate = useNavigate();

  const handleCopyRef = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(booking.booking_reference ?? "");
    toast.success("Booking reference copied");
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/bookings/${booking.id}`, "_blank");
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/bookings/${booking.id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          {booking.booking_reference}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleView}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Open
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleOpenInNewTab}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in new tab
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyRef}>
          <Copy className="h-4 w-4 mr-2" />
          Copy reference
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
