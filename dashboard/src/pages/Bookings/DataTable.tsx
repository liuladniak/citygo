import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "./DataTablePagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isServerSide: boolean;
  page: number;
  total: number;
  limit: number;
  search: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
  className?: string;
}
export function DataTable<TData extends { id: string | number }, TValue>({
  columns,
  data,
  isServerSide,
  page,
  total,
  limit,
  onPageChange,
  search,
  onSearchChange,
  isLoading,
  className,
}: DataTableProps<TData, TValue>) {
  const pageCount = Math.ceil(total / limit);
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState(search);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    if (!isServerSide) return;
    const timeout = setTimeout(() => {
      onSearchChange(inputValue);
    }, 400);
    return () => clearTimeout(timeout);
  }, [inputValue, onSearchChange, isServerSide]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    ...(isServerSide
      ? {
          pageCount,
          manualPagination: true,
          manualFiltering: true,
          manualSorting: true,
          state: {
            pagination: { pageIndex: page - 1, pageSize: limit },
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
          },
          onPaginationChange: (updater) => {
            const next =
              typeof updater === "function"
                ? updater({ pageIndex: page - 1, pageSize: limit })
                : updater;
            onPageChange(next.pageIndex + 1);
          },
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          globalFilterFn: "includesString",
          state: {
            globalFilter,
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
          },
          onGlobalFilterChange: setGlobalFilter,
        }),
  });

  return (
    <div className={className}>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search bookings..."
          value={isServerSide ? inputValue : globalFilter}
          onChange={(e) =>
            isServerSide
              ? setInputValue(e.target.value)
              : setGlobalFilter(e.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-6">
          <div className="text-muted-foreground flex-1 text-sm px-6">
            {table.getSelectedRowModel().rows.length} of{" "}
            {table.getRowModel().rows.length} row(s) selected.
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const bookingId = row.original.id;

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/bookings/${bookingId}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
