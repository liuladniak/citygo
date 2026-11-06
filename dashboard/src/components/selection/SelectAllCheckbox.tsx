import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  state: boolean | "indeterminate";
  onToggle: () => void;
  disabled?: boolean;
  label?: string;
};

export function SelectAllCheckbox({
  state,
  onToggle,
  disabled,
  label = "Select all",
}: Props) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground">
      <Checkbox
        checked={state}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
      <span>{label}</span>
    </label>
  );
}
