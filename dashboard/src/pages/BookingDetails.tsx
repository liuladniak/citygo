import { useParams } from "react-router-dom";
import { useBookingDetails } from "@/hooks/useBookingDetails";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Globe,
  Mail,
  CreditCard,
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const { data: booking, isLoading } = useBookingDetails(bookingId);
  console.log("booking:", booking);
  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!booking)
    return <div className="p-10 text-center">Booking not found</div>;

  const balance = Number(booking.total_price) - Number(booking.amount_paid);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Booking Details</CardTitle>
      </CardHeader>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {booking.booking_reference}
            </h1>
            <Badge
              variant={booking.status === "confirmed" ? "default" : "secondary"}
              className="capitalize"
            >
              {booking.status?.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Created on {new Date(booking.created_at!).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Print Voucher</Button>
          <Button>Send Reminder</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Experience Details</CardTitle>
                <CardDescription>
                  Logistics for the upcoming tour
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200 bg-blue-50"
              >
                {booking.is_custom_tour ? "Custom Tour" : "Standard Tour"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.booking_date}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.display_start_time} - {booking.display_end_time}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 col-span-full">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm font-medium">Meeting Point</p>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md mt-1">
                      {booking.meeting_point ||
                        "No meeting point specified yet."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guest Manifest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Primary Contact
                  </p>
                  <p className="text-sm">{booking.primary_contact_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.primary_contact_email}
                  </p>
                </div>
                <div className="space-y-1 text-right md:text-left">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" /> Party Size
                  </p>
                  <p className="text-sm">
                    {booking.guest_distribution?.adults} Adults,{" "}
                    {booking.guest_distribution?.children} Children
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-muted-foreground uppercase">
                  Language:
                </span>
                <Badge variant="outline">{booking.language}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Total Price</span>
                <span>${Number(booking.total_price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Amount Paid</span>
                <span>-${Number(booking.amount_paid).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Balance Due</span>
                <span
                  className={balance > 0 ? "text-red-500" : "text-green-600"}
                >
                  ${balance.toFixed(2)}
                </span>
              </div>
              {balance > 0 && (
                <Button
                  className="w-full variant-destructive bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                  variant="outline"
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Collect Payment
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Staffing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground">
                  {booking.guide_name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{booking.guide_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Assigned Guide
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Reassign Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
