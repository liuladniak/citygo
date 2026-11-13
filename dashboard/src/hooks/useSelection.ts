import { useCallback, useEffect, useMemo, useState } from "react";

type Options<T> = {
  getId: (item: T) => number;
  canSelect?: (item: T) => boolean;
};

export function useSelection<T>(
  items: T[],
  { getId, canSelect = () => true }: Options<T>,
) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  // getId/canSelect are usually inline functions, so depend on items only
  const selectableIds = useMemo(
    () => items.filter(canSelect).map(getId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  );

  // F12: drop ids that are no longer visible or selectable
  useEffect(() => {
    setSelected((prev) => {
      const visible = new Set(selectableIds);
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [selectableIds]);

  const toggle = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(selectableIds));

  return {
    selectedIds: [...selected],
    count: selected.size,
    isSelected: (id: number) => selected.has(id),
    canSelectAny: selectableIds.length > 0,
    headerState: allSelected
      ? true
      : selected.size > 0
        ? ("indeterminate" as const)
        : false,
    toggle,
    toggleAll,
    clear,
  };
}
