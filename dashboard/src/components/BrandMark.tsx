import { cn } from "@/lib/utils";

/** The orange "CG" tile used on the login page and in the sidebar. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white",
        className,
      )}
    >
      CG
    </div>
  );
}
