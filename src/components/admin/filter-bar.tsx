import type { ReactNode } from "react";

type FilterBarProps = {
  title?: string;
  chips: string[];
  trailing?: ReactNode;
};

export function FilterBar({ title = "Filtros:", chips, trailing }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] bg-white px-4 py-4 coastal-shadow">
      <div className="flex items-center gap-2 pr-2 text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">filter_list</span>
        <span className="text-sm font-medium">{title}</span>
      </div>

      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          className="rounded-xl bg-surface-container px-4 py-2 text-sm text-on-surface-variant transition hover:bg-surface-container-high"
        >
          {chip}
        </button>
      ))}

      {trailing ? <div className="ml-auto">{trailing}</div> : null}
    </div>
  );
}
