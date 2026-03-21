import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { useParams } from "react-router-dom";
import { useBookingDetails } from "@/hooks/useBookingDetails";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/ui/BackButton";
import { AssignGuideModal } from "@/components/modals/AssignGuideModal";
import CancelBookingDialog from "@/components/modals/CancelBookingDialog";
import ConfirmBookingDialog from "@/components/modals/ConfirmBookingDialog";
import EditContactModal from "@/components/modals/EditContactModal";
import EditDetailsModal from "@/components/modals/EditDetailsModal";
import EditGuestsModal from "@/components/modals/EditGuestsModal";
import PaymentModal from "@/components/modals/PaymentModal";
import { DownloadInvoiceButton } from "@/components/InvoicePDF";

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  confirmed: { bg: "bg-green-100", text: "text-green-800", label: "Confirmed" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  completed: { bg: "bg-blue-100", text: "text-blue-800", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
};

const roleStyles: Record<string, string> = {
  lead_guide: "bg-blue-100 text-blue-700",
  assistant_guide: "bg-purple-100 text-purple-700",
  driver: "bg-orange-100 text-orange-700",
};

const ROLE_LABELS: Record<string, string> = {
  lead_guide: "Lead Guide",
  assistant_guide: "Assistant Guide",
  driver: "Driver",
};

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const queryClient = useQueryClient();
  const { data: booking, isLoading } = useBookingDetails(bookingId);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editGuestsOpen, setEditGuestsOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: company } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data } = await axios.get(`/api/company/settings`);
      return data;
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  if (!booking)
    return (
      <div className="p-10 text-center text-muted-foreground">
        Booking not found
      </div>
    );

  const balance = Number(booking.total_price) - Number(booking.amount_paid);
  const statusStyle =
    statusConfig[booking.status?.toLowerCase() ?? ""] ?? statusConfig.draft;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                {booking.booking_reference}
              </h1>
              <Badge
                className={`${statusStyle.bg} ${statusStyle.text} font-medium`}
                variant="secondary"
              >
                {statusStyle.label}
              </Badge>
              {booking.tour_name && (
                <span className="text-muted-foreground text-sm font-medium">
                  {booking.is_custom_tour
                    ? "✨ Custom Tour"
                    : `🗺️ ${booking.tour_name}`}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Created{" "}
              {new Date(booking.created_at!).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {booking.source && (
                <span className="ml-2 text-xs">
                  · via {booking.source.replace("_", " ")}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(booking.status === "pending" || booking.status === "draft") && (
            <Button
              variant="outline"
              className="text-green-700 border-green-300 hover:bg-green-50"
              onClick={() => setConfirmDialogOpen(true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Booking
            </Button>
          )}
          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setCancelDialogOpen(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handlePrintVoucher(booking.id)}
          >
            Print Voucher
          </Button>
          <DownloadInvoiceButton booking={booking} company={company} />
          <Button>Send Reminder</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Experience Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditDetailsOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-muted">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
                      Date
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(booking.tour_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-muted">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
                      Time
                    </p>
                    <p className="text-sm font-medium">
                      {formatTime(booking.display_start_time)} –{" "}
                      {formatTime(booking.display_end_time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="mt-0.5 p-1.5 rounded-md bg-muted shrink-0">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
                      Meeting Point
                    </p>
                    {booking.meeting_point ? (
                      <p className="text-sm font-medium">
                        {booking.meeting_point}
                      </p>
                    ) : (
                      <button
                        onClick={() => setEditDetailsOpen(true)}
                        className="text-sm text-orange-500 hover:underline"
                      >
                        + Set meeting point
                      </button>
                    )}
                  </div>
                </div>
                {booking.notes && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <div className="mt-0.5 p-1.5 rounded-md bg-muted shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
                        Notes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Guest Manifest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Primary Contact
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setEditContactOpen(true)}
                  >
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-muted">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {booking.primary_contact_name}
                      </p>
                      {booking.primary_contact_email && (
                        <p className="text-xs text-muted-foreground">
                          {booking.primary_contact_email}
                        </p>
                      )}
                      {booking.primary_contact_phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {booking.primary_contact_phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-muted">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
                        Language
                      </p>
                      <p className="text-sm font-medium uppercase">
                        {booking.language}
                      </p>
                    </div>
                  </div>
                  {booking.source && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-md bg-muted">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
                          Source
                        </p>
                        <p className="text-sm font-medium capitalize">
                          {booking.source.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Party Size
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setEditGuestsOpen(true)}
                  >
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-muted">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {(booking.guest_distribution?.adults ?? 0) +
                        (booking.guest_distribution?.children ?? 0) +
                        (booking.guest_distribution?.infants ?? 0)}{" "}
                      total
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.guest_distribution?.adults} adults
                      {booking.guest_distribution?.children
                        ? `, ${booking.guest_distribution.children} children`
                        : ""}
                      {booking.guest_distribution?.infants
                        ? `, ${booking.guest_distribution.infants} infants`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              {booking.guest_list && booking.guest_list.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                      Guest Names
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {booking.guest_list.map((g: any, i: number) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {g.full_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.status === "cancelled" ? (
                <>
                  {(() => {
                    const totalPaid =
                      booking.payment_history
                        ?.filter((p: any) => Number(p.amount) > 0)
                        .reduce(
                          (sum: number, p: any) => sum + Number(p.amount),
                          0
                        ) ?? 0;
                    const totalRefunded =
                      booking.payment_history
                        ?.filter((p: any) => Number(p.amount) < 0)
                        .reduce(
                          (sum: number, p: any) =>
                            sum + Math.abs(Number(p.amount)),
                          0
                        ) ?? 0;
                    const refundDue = totalPaid - totalRefunded;

                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Total Charged
                          </span>
                          <span className="font-medium">
                            €{totalPaid.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Total Refunded
                          </span>
                          <span className="font-medium text-emerald-600">
                            €{totalRefunded.toFixed(2)}
                          </span>
                        </div>
                        <Separator />
                        {refundDue > 0 ? (
                          <>
                            <div className="flex justify-between font-semibold">
                              <span>Refund Pending</span>
                              <span className="text-orange-500">
                                €{refundDue.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-orange-500 font-medium">
                              <AlertTriangle className="h-4 w-4" /> Refund not
                              yet issued
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-600 font-medium">
                            <CheckCircle className="h-4 w-4" /> Fully Refunded
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Price</span>
                    <span className="font-medium">
                      €{Number(booking.total_price).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-medium text-emerald-600">
                      €{Number(booking.amount_paid).toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Balance Due</span>
                    <span
                      className={
                        balance > 0 ? "text-red-500" : "text-emerald-600"
                      }
                    >
                      €{balance.toFixed(2)}
                    </span>
                  </div>
                  {balance > 0 ? (
                    <Button
                      className="w-full mt-1"
                      onClick={() => setPaymentModalOpen(true)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Collect €{balance.toFixed(2)}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-600 font-medium">
                      <CheckCircle className="h-4 w-4" /> Fully Paid
                    </div>
                  )}
                </>
              )}

              {booking.payment_history &&
                booking.payment_history.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                        Payment History
                      </p>
                      {booking.payment_history.map((p: any) => (
                        <div
                          key={p.id}
                          className="flex justify-between text-xs text-muted-foreground py-1"
                        >
                          <span className="capitalize">
                            {p.method?.replace("_", " ")} ·{" "}
                            {new Date(p.paid_at).toLocaleDateString()}
                          </span>
                          <span
                            className={`font-medium ${
                              Number(p.amount) < 0
                                ? "text-orange-500"
                                : "text-foreground"
                            }`}
                          >
                            €{Number(p.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Staffing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.staff && booking.staff.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {booking.staff.map((s: any) => (
                    <div
                      key={s.guide_id}
                      className="flex items-center gap-3 py-1"
                    >
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm text-secondary-foreground shrink-0">
                        {s.guide_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {s.guide_name}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-xs mt-0.5 ${
                            roleStyles[s.role] ?? "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ROLE_LABELS[s.role] ?? s.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-orange-500">
                  No staff assigned yet.
                </p>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setAssignModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Manage Staff
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AssignGuideModal
        open={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          invalidate();
        }}
        bookingId={booking.id}
        bookingDate={booking.tour_date.split("T")[0]}
        bookingReference={booking.booking_reference}
      />
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        bookingId={booking.id}
        balance={balance}
        onSuccess={invalidate}
      />

      <EditDetailsModal
        open={editDetailsOpen}
        onClose={() => setEditDetailsOpen(false)}
        booking={booking}
        onSuccess={invalidate}
      />

      <EditContactModal
        open={editContactOpen}
        onClose={() => setEditContactOpen(false)}
        booking={booking}
        onSuccess={invalidate}
      />
      <EditGuestsModal
        open={editGuestsOpen}
        onClose={() => setEditGuestsOpen(false)}
        booking={booking}
        onSuccess={invalidate}
      />
      <ConfirmBookingDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        bookingId={booking.id}
        bookingReference={booking.booking_reference}
        onSuccess={invalidate}
      />
      <CancelBookingDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        bookingId={booking.id}
        bookingReference={booking.booking_reference}
        bookingDate={booking.tour_date}
        amountPaid={Number(booking.amount_paid)}
        onSuccess={invalidate}
      />
    </div>
  );
}

const handlePrintVoucher = async (id: number) => {
  try {
    const { data } = await axios.get(`/api/bookings/${id}/voucher`);

    const includesList = data.includes
      ? data.includes
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];
    const essentialsList = data.essentials
      ? data.essentials
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Voucher - ${data.booking_reference}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: white; }
            .voucher { max-width: 800px; margin: 0 auto; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
            .brand { font-size: 24px; font-weight: 800; color: #111; }
            .brand span { color: #f97316; }
            .ref { text-align: right; }
            .ref h2 { font-size: 20px; font-weight: 700; }
            .ref p { font-size: 13px; color: #666; margin-top: 2px; }
            .status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #dcfce7; color: #166534; margin-top: 6px; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 12px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .field label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 2px; }
            .field p { font-size: 14px; font-weight: 500; }
            .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
            .highlight-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; font-size: 13px; }
            .highlight-dot { width: 6px; height: 6px; border-radius: 50%; background: #f97316; margin-top: 5px; flex-shrink: 0; }
            .tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
            .include-tag { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-radius: 6px; padding: 3px 10px; font-size: 12px; }
            .essential-tag { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; border-radius: 6px; padding: 3px 10px; font-size: 12px; }
            .guide-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
            .guide-avatar { width: 32px; height: 32px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
            .guide-role { font-size: 11px; color: #888; }
            .overview-text { font-size: 13px; color: #444; line-height: 1.6; }
            .ad-section { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-top: 32px; }
            .ad-title { font-size: 13px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
            .ad-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
            .ad-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
            .ad-card-name { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
            .ad-card-meta { font-size: 11px; color: #888; }
            .ad-card-price { font-size: 13px; font-weight: 700; color: #f97316; margin-top: 6px; }
            .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #aaa; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="voucher">
            <div class="header">
              <div>
                <div class="brand">City<span>Go</span></div>
                <p style="font-size:12px;color:#888;margin-top:2px">Istanbul City Tours</p>
              </div>
              <div class="ref">
                <h2>${data.booking_reference}</h2>
                <p>Booking Confirmation</p>
                <span class="status-badge">${
                  data.status?.charAt(0).toUpperCase() + data.status?.slice(1)
                }</span>
              </div>
            </div>

            <hr class="divider" />

            <div class="section">
              <p class="section-title">Experience</p>
              <div class="grid-2">
                <div class="field"><label>Tour</label><p>${
                  data.tour_name ?? "Custom Tour"
                }</p></div>
                <div class="field"><label>Category</label><p>${
                  data.category ?? "—"
                }</p></div>
                <div class="field"><label>Date</label><p>${formatDate(
                  data.tour_date
                )}</p></div>
                <div class="field"><label>Time</label><p>${formatTime(
                  data.display_start_time
                )} – ${formatTime(data.display_end_time)}</p></div>
                <div class="field"><label>Duration</label><p>${
                  data.tour_duration ?? "—"
                }</p></div>
                <div class="field"><label>Activity Level</label><p>${
                  data.activity_level ?? "—"
                }</p></div>
                ${
                  data.meeting_point
                    ? `<div class="field" style="grid-column:span 2"><label>Meeting Point</label><p>${data.meeting_point}</p></div>`
                    : ""
                }
              </div>
            </div>

            <hr class="divider" />

            <div class="section">
              <p class="section-title">Guest Information</p>
              <div class="grid-2">
                <div class="field">
                  <label>Primary Contact</label>
                  <p>${data.primary_contact_name}</p>
                  ${
                    data.primary_contact_email
                      ? `<p style="font-size:12px;color:#666">${data.primary_contact_email}</p>`
                      : ""
                  }
                  ${
                    data.primary_contact_phone
                      ? `<p style="font-size:12px;color:#666">${data.primary_contact_phone}</p>`
                      : ""
                  }
                </div>
                <div class="field">
                  <label>Party Size</label>
                  <p>${
                    (data.guest_distribution?.adults ?? 0) +
                    (data.guest_distribution?.children ?? 0) +
                    (data.guest_distribution?.infants ?? 0)
                  } total</p>
                  <p style="font-size:12px;color:#666">
                    ${data.guest_distribution?.adults} adults
                    ${
                      data.guest_distribution?.children
                        ? `, ${data.guest_distribution.children} children`
                        : ""
                    }
                    ${
                      data.guest_distribution?.infants
                        ? `, ${data.guest_distribution.infants} infants`
                        : ""
                    }
                  </p>
                </div>
                <div class="field"><label>Language</label><p style="text-transform:uppercase">${
                  data.language
                }</p></div>
              </div>
            </div>

            ${
              data.staff?.length > 0
                ? `
              <hr class="divider" />
              <div class="section">
                <p class="section-title">Your Guide${
                  data.staff.length > 1 ? "s" : ""
                }</p>
                ${data.staff
                  .map(
                    (s: any) => `
                  <div class="guide-item">
                    <div class="guide-avatar">${s.guide_name.charAt(0)}</div>
                    <div>
                      <p style="font-size:14px;font-weight:600">${
                        s.guide_name
                      }</p>
                      <p class="guide-role">${ROLE_LABELS[s.role] ?? s.role}</p>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            ${
              data.overview
                ? `
              <hr class="divider" />
              <div class="section">
                <p class="section-title">About This Tour</p>
                ${
                  data.overview_title
                    ? `<p style="font-weight:600;margin-bottom:6px;font-size:15px">${data.overview_title}</p>`
                    : ""
                }
                <p class="overview-text">${data.overview}</p>
              </div>
            `
                : ""
            }

            ${
              data.highlights?.length > 0
                ? `
              <hr class="divider" />
              <div class="section">
                <p class="section-title">Highlights</p>
                ${data.highlights
                  .map(
                    (h: any) => `
                  <div class="highlight-item">
                    <div class="highlight-dot"></div>
                    <span>${h.highlight}</span>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            ${
              includesList.length > 0
                ? `
              <hr class="divider" />
              <div class="section">
                <p class="section-title">What's Included</p>
                <div class="tag-list">
                  ${includesList
                    .map(
                      (item: string) =>
                        `<span class="include-tag">✓ ${item}</span>`
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }

            ${
              essentialsList.length > 0
                ? `
              <hr class="divider" />
              <div class="section">
                <p class="section-title">What to Bring</p>
                <div class="tag-list">
                  ${essentialsList
                    .map(
                      (item: string) =>
                        `<span class="essential-tag">· ${item}</span>`
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }

            ${
              data.ad_tours?.length > 0
                ? `
              <div class="ad-section">
                <p class="ad-title">✨ Explore More with CityGo</p>
                <div class="ad-grid">
                  ${data.ad_tours
                    .map(
                      (t: any) => `
                    <div class="ad-card">
                      <p class="ad-card-name">${t.tour_name}</p>
                      <p class="ad-card-meta">${t.category} · ${t.duration}</p>
                      <p class="ad-card-price">From €${Number(t.price).toFixed(
                        2
                      )}pp</p>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }

            <div class="footer">
              <hr class="divider" />
              <p>Thank you for booking with CityGo · Istanbul City Tours</p>
              <p style="margin-top:4px">This voucher is your proof of booking. Please present it on the day of your tour.</p>
            </div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (err) {
    console.error("Failed to load voucher data", err);
  }
};
