import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A bordered section with a title row and an optional action on the right. */
export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border bg-card", className)}>
      <header className="flex min-h-12 items-center justify-between gap-3 border-b px-4 py-2 sm:px-5">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </header>
      <div className="px-4 sm:px-5">{children}</div>
    </section>
  );
}

/** Rows of label + value, separated by hairlines. */
export function DetailList({ children }: { children: ReactNode }) {
  return <dl className="divide-y">{children}</dl>;
}

export function DetailRow({
  label,
  children,
  action,
}: {
  label: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[9rem_1fr_auto] sm:items-baseline sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm font-medium break-words">{children}</dd>
      {action && <div className="-ml-2 sm:ml-0 sm:justify-self-end">{action}</div>}
    </div>
  );
}
