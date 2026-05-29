import type { ReactNode } from "react";

type DataTableProps = {
  headers: string[];
  rows: ReactNode[][];
  footer?: ReactNode;
};

export function DataTable({ headers, rows, footer }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-white coastal-shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-surface-container-low">
              {headers.map((header) => (
                <th
                  key={header}
                  className="border-b border-outline-variant/20 px-5 py-5 text-left text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="align-top">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className="border-b border-outline-variant/15 px-5 py-5 text-sm text-on-surface"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer ? <div className="px-5 py-4">{footer}</div> : null}
    </div>
  );
}
