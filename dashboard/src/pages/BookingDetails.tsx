import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { Link, useParams } from "react-router-dom";
import { useBookingDetails } from "@/hooks/useBookingDetails";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Mail,
  MoreHorizontal,
  Pencil,
  UserPlus,
  XCircle,
} from "lucide-react";
import {
  cn,
  escapeDeep,
  formatDate,
  formatMoney,
  formatTime,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailList, DetailRow, Panel } from "@/components/DetailPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { AssignGuideModal } from "@/components/modals/AssignGuideModal";
import CancelBookingDialog from "@/components/modals/CancelBookingDialog";
import ConfirmBookingDialog from "@/components/modals/ConfirmBookingDialog";
import EditContactModal from "@/components/modals/EditContactModal";
import EditDetailsModal from "@/components/modals/EditDetailsModal";
import EditGuestsModal from "@/components/modals/EditGuestsModal";
import PaymentModal from "@/components/modals/PaymentModal";
import { DownloadInvoiceButton } from "@/components/InvoicePDF";

const ROLE_LABELS: Record<string, string> = {
  lead_guide: "Lead guide",
  assistant_guide: "Assistant guide",
  driver: "Driver",
};

const humanize = (value?: string | null) =>
  value ? value.replace(/_/g, " ") : "";

const languageName = (code?: string | null) => {
  if (!code) return "—";
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code.toUpperCase();
  }
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function EditButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-mr-2 h-8 text-muted-foreground"
      onClick={onClick}
      aria-label={label}
    >
      <Pencil className="size-3.5" />
      Edit
    </Button>
  );
}

function SummaryCell({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <div className="bg-card p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-base font-semibold tabular-nums break-words",
          valueClassName,
        )}
      >
        {value}
      </dd>
      {hint && (
        <p className="mt-0.5 text-xs text-muted-foreground break-words">
          {hint}
        </p>
      )}
    </div>
  );
}

function BookingDetailsSkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8"
      aria-busy="true"
      aria-label="Loading booking"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const queryClient = useQueryClient();
  const { data: booking, isLoading } = useBookingDetails(bookingId);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
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

  if (isLoading) return <BookingDetailsSkeleton />;
  if (!booking)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="page-title">Booking not found</h1>
        <p className="page-description">
          It may have been deleted, or the link is wrong.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/bookings">Back to bookings</Link>
        </Button>
      </div>
    );

  const status = booking.status?.toLowerCase() ?? "";
  const isCancelled = status === "cancelled";
  const canConfirm = status === "pending" || status === "draft";
  const canCancel = !isCancelled && status !== "completed";
  const canRemind =
    (status === "pending" || status === "confirmed") &&
    Boolean(booking.primary_contact_email);

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      await axios.post(`/api/bookings/${booking.id}/reminder`);
      toast.success(`Reminder sent to ${booking.primary_contact_email}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Could not send the reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  const totalPrice = Number(booking.total_price);
  const amountPaid = Number(booking.amount_paid);
  const balance = totalPrice - amountPaid;
  const paidPercent =
    totalPrice > 0
      ? Math.min(100, Math.max(0, (amountPaid / totalPrice) * 100))
      : 0;

  const payments: any[] = booking.payment_history ?? [];
  const totalCharged = payments
    .filter((p) => Number(p.amount) > 0)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalRefunded = payments
    .filter((p) => Number(p.amount) < 0)
    .reduce((sum, p) => sum + Math.abs(Number(p.amount)), 0);
  const refundDue = totalCharged - totalRefunded;

  const adults = booking.guest_distribution?.adults ?? 0;
  const children = booking.guest_distribution?.children ?? 0;
  const infants = booking.guest_distribution?.infants ?? 0;
  const totalGuests = adults + children + infants;
  const partyBreakdown = [
    plural(adults, "adult"),
    children ? `${children} ${children === 1 ? "child" : "children"}` : null,
    infants ? plural(infants, "infant") : null,
  ]
    .filter(Boolean)
    .join(", ");

  const showCollect = !isCancelled && balance > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-4">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Link to="/bookings" className="hover:text-foreground">
            Bookings
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-foreground">{booking.booking_reference}</span>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="page-title">{booking.booking_reference}</h1>
              <StatusBadge status={booking.status} />
            </div>
            <p className="page-description">
              {booking.is_custom_tour
                ? "Custom tour"
                : (booking.tour_name ?? "No tour selected")}
              {" · "}
              Booked{" "}
              {new Date(booking.created_at!).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {booking.source && <> via {humanize(booking.source)}</>}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {canConfirm ? (
              <Button onClick={() => setConfirmDialogOpen(true)}>
                <CheckCircle2 className="size-4" />
                Confirm booking
              </Button>
            ) : showCollect ? (
              <Button onClick={() => setPaymentModalOpen(true)}>
                <CreditCard className="size-4" />
                Collect {formatMoney(balance)}
              </Button>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="More actions">
                  <MoreHorizontal className="size-4" />
                  <span className="hidden sm:inline">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onSelect={() => handlePrintVoucher(booking.id)}
                >
                  <FileText className="size-4" />
                  Print voucher
                </DropdownMenuItem>
                <DownloadInvoiceButton
                  variant="menu"
                  booking={booking}
                  company={company}
                />
                {canRemind && (
                  <DropdownMenuItem
                    disabled={sendingReminder}
                    onSelect={handleSendReminder}
                  >
                    <Mail className="size-4" />
                    Send reminder
                  </DropdownMenuItem>
                )}
                {canCancel && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => setCancelDialogOpen(true)}
                    >
                      <XCircle className="size-4" />
                      Cancel booking
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
        <SummaryCell label="Tour date" value={formatDate(booking.tour_date)} />
        <SummaryCell
          label="Time"
          value={`${formatTime(booking.display_start_time)} – ${formatTime(
            booking.display_end_time,
          )}`.replace(/ (AM|PM)/g, "\u00A0$1")}
          hint={booking.tour_duration ?? undefined}
        />
        <SummaryCell
          label="Guests"
          value={plural(totalGuests, "guest")}
          hint={partyBreakdown}
        />
        {isCancelled ? (
          <SummaryCell
            label="Refund due"
            value={formatMoney(Math.max(refundDue, 0))}
            hint={refundDue > 0 ? "Not yet issued" : "Nothing owed"}
            valueClassName={
              refundDue > 0 ? "text-amber-700 dark:text-amber-400" : undefined
            }
          />
        ) : (
          <SummaryCell
            label="Balance due"
            value={formatMoney(Math.max(balance, 0))}
            hint={
              balance > 0
                ? `${formatMoney(amountPaid)} of ${formatMoney(totalPrice)} paid`
                : "Paid in full"
            }
            valueClassName={
              balance > 0
                ? "text-red-700 dark:text-red-400"
                : "text-emerald-700 dark:text-emerald-400"
            }
          />
        )}
      </dl>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel
            title="Tour details"
            action={
              <EditButton
                label="Edit tour details"
                onClick={() => setEditDetailsOpen(true)}
              />
            }
          >
            <DetailList>
              <DetailRow label="Tour">
                {booking.is_custom_tour
                  ? "Custom tour"
                  : (booking.tour_name ?? "—")}
              </DetailRow>
              <DetailRow label="Meeting point">
                {booking.meeting_point ? (
                  booking.meeting_point
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditDetailsOpen(true)}
                    className="text-amber-700 hover:underline dark:text-amber-400"
                  >
                    Set meeting point
                  </button>
                )}
              </DetailRow>
              {booking.notes && (
                <DetailRow label="Notes">
                  <span className="font-normal whitespace-pre-line">
                    {booking.notes}
                  </span>
                </DetailRow>
              )}
            </DetailList>
          </Panel>

          <Panel title="Guests">
            <DetailList>
              <DetailRow
                label="Contact"
                action={
                  <EditButton
                    label="Edit contact"
                    onClick={() => setEditContactOpen(true)}
                  />
                }
              >
                <p>{booking.primary_contact_name}</p>
                {booking.primary_contact_email && (
                  <a
                    href={`mailto:${booking.primary_contact_email}`}
                    className="block font-normal text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {booking.primary_contact_email}
                  </a>
                )}
                {booking.primary_contact_phone && (
                  <a
                    href={`tel:${booking.primary_contact_phone}`}
                    className="block font-normal text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {booking.primary_contact_phone}
                  </a>
                )}
              </DetailRow>
              <DetailRow label="Language">
                {languageName(booking.language)}
              </DetailRow>
              <DetailRow
                label="Party"
                action={
                  <EditButton
                    label="Edit guests"
                    onClick={() => setEditGuestsOpen(true)}
                  />
                }
              >
                <p>{plural(totalGuests, "guest")}</p>
                <p className="font-normal text-muted-foreground">
                  {partyBreakdown}
                </p>
              </DetailRow>
              {booking.guest_list && booking.guest_list.length > 0 && (
                <DetailRow label="Guest names">
                  <ul className="space-y-0.5 font-normal">
                    {booking.guest_list.map((g: any, i: number) => (
                      <li key={i}>{g.full_name}</li>
                    ))}
                  </ul>
                </DetailRow>
              )}
            </DetailList>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Payment">
            <div className="space-y-4 py-4">
              {isCancelled ? (
                <>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Charged</dt>
                      <dd className="font-medium tabular-nums">
                        {formatMoney(totalCharged)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Refunded</dt>
                      <dd className="font-medium tabular-nums">
                        {formatMoney(totalRefunded)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <dt>Refund due</dt>
                      <dd className="tabular-nums">
                        {formatMoney(Math.max(refundDue, 0))}
                      </dd>
                    </div>
                  </dl>
                  {refundDue > 0 ? (
                    <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="size-4 shrink-0" />
                      Refund not issued yet
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-4 shrink-0" />
                      Fully refunded
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label="Amount paid"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(paidPercent)}
                    >
                      <div
                        className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500"
                        style={{ width: `${paidPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {Math.round(paidPercent)}% paid
                    </p>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total</dt>
                      <dd className="font-medium tabular-nums">
                        {formatMoney(totalPrice)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Paid</dt>
                      <dd className="font-medium tabular-nums">
                        {formatMoney(amountPaid)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <dt>Balance due</dt>
                      <dd
                        className={cn(
                          "tabular-nums",
                          balance > 0
                            ? "text-red-700 dark:text-red-400"
                            : "text-emerald-700 dark:text-emerald-400",
                        )}
                      >
                        {formatMoney(Math.max(balance, 0))}
                      </dd>
                    </div>
                  </dl>
                  {showCollect && (
                    <Button
                      className="w-full"
                      onClick={() => setPaymentModalOpen(true)}
                    >
                      <CreditCard className="size-4" />
                      Collect {formatMoney(balance)}
                    </Button>
                  )}
                </>
              )}

              {payments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="mb-2 text-sm font-medium">History</h3>
                  <ul className="space-y-2 text-sm">
                    {payments.map((p) => (
                      <li key={p.id} className="flex justify-between gap-3">
                        <span className="text-muted-foreground capitalize">
                          {humanize(p.method)}
                          {p.paid_at &&
                            ` · ${new Date(p.paid_at).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}`}
                        </span>
                        <span
                          className={cn(
                            "font-medium tabular-nums",
                            Number(p.amount) < 0 &&
                              "text-amber-700 dark:text-amber-400",
                          )}
                        >
                          {formatMoney(p.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Panel>

          <Panel
            title="Staff"
            action={
              booking.staff && booking.staff.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mr-2 h-8 text-muted-foreground"
                  onClick={() => setAssignModalOpen(true)}
                >
                  <UserPlus className="size-3.5" />
                  Manage
                </Button>
              ) : undefined
            }
          >
            <div className="py-4">
              {booking.staff && booking.staff.length > 0 ? (
                <ul className="space-y-3">
                  {booking.staff.map((s: any) => (
                    <li key={s.guide_id} className="flex items-center gap-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
                        aria-hidden
                      >
                        {s.guide_name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {s.guide_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ROLE_LABELS[s.role] ?? humanize(s.role)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No one is assigned to this tour yet.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setAssignModalOpen(true)}
                  >
                    <UserPlus className="size-4" />
                    Assign staff
                  </Button>
                </div>
              )}
            </div>
          </Panel>
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
    const { data: raw } = await axios.get(`/api/bookings/${id}/voucher`);
    const data = escapeDeep(raw);

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
                  data.tour_date,
                )}</p></div>
                <div class="field"><label>Time</label><p>${formatTime(
                  data.display_start_time,
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
                `,
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
                `,
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
                        `<span class="include-tag">✓ ${item}</span>`,
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
                        `<span class="essential-tag">· ${item}</span>`,
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
                        2,
                      )}pp</p>
                    </div>
                  `,
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
