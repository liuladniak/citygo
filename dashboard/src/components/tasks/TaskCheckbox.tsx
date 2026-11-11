import { Checkbox } from "@/components/ui/checkbox";
import { cleanTaskTitle } from "@/lib/tasks";

type Props = {
  task: { title: string; booking_reference?: string | null };
  checked: boolean;
  onToggle: () => void;
};

export function TaskCheckbox({ task, checked, onToggle }: Props) {
  const name =
    cleanTaskTitle(task.title) +
    (task.booking_reference ? `, ${task.booking_reference}` : "");
  return (
    <label
      className="-ml-2 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        aria-label={`Select task: ${name}`}
      />
    </label>
  );
}
