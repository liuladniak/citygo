import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Users } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ActionsCell } from "./ActionsCell";
import { StatusBadge } from "@/components/StatusBadge";
import type { Booking } from "@/types/booking";

export const Columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "booking_reference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium text-muted-foreground">
        {row.original.booking_reference}
      </span>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const b = row.original;
      return (
        <div>
          <p className="font-medium text-sm">{b.primary_contact_name}</p>
          <p className="text-xs text-muted-foreground">
            {b.primary_contact_email ?? "—"}
          </p>
        </div>
      );
    },
  },
  {
    id: "tour",
    header: "Tour",
    cell: ({ row }) => {
      const b = row.original;
      return (
        <div>
          <p className="text-sm font-medium truncate max-w-[200px]">
            {b.tour_name ?? (b.is_custom_tour ? "Custom Tour" : "—")}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Users className="h-3 w-3" />
            <span>{b.total_guests ?? "—"} guests</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "tour_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="h-auto p-0 text-sm font-medium hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tour Date
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.tour_date);
      const isToday =
        format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
      const isPast = date < new Date();
      return (
        <div>
          <p
            className={`text-sm ${
              isToday
                ? "font-semibold text-blue-600 dark:text-blue-400"
                : isPast && row.original.status !== "cancelled"
                ? "text-muted-foreground"
                : ""
            }`}
          >
            {isToday ? "Today" : format(date, "MMM d, yyyy")}
          </p>
          {row.original.display_start_time && (
            <p className="text-xs text-muted-foreground">
              {row.original.display_start_time.slice(0, 5)}
              {row.original.display_end_time
                ? ` – ${row.original.display_end_time.slice(0, 5)}`
                : ""}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: "payment",
    header: "Payment",
    cell: ({ row }) => {
      const b = row.original;
      const paid = parseFloat((b.amount_paid as any) ?? 0);
      const total = parseFloat((b.total_price as any) ?? 0);
      const isFullyPaid = paid >= total && total > 0;
      const hasBalance = total > paid && b.status !== "cancelled";

      return (
        <div>
          <p className="text-sm font-medium">€{paid.toFixed(0)}</p>
          {hasBalance && (
            <p className="text-xs text-red-600 dark:text-red-400">
              €{(total - paid).toFixed(0)} due
            </p>
          )}
          {isFullyPaid && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Paid in full</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => <ActionsCell booking={row.original} />,
    enableHiding: false,
  },
];
