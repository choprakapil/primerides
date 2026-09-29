import React, { ReactNode } from "react";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-12 text-center bg-[#141414] rounded-2xl border border-white/10 text-neutral-400 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#141414] shadow-xl">
      <table className="w-full text-left text-sm text-neutral-300">
        <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-neutral-400 border-b border-white/10">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-4 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="hover:bg-white/[0.02] transition-colors"
            >
              {columns.map((col, idx) => (
                <td key={idx} className={`px-6 py-4 ${col.className || ""}`}>
                  {col.render
                    ? col.render(item)
                    : col.accessor
                    ? String(item[col.accessor] ?? "")
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
