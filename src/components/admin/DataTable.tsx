import React, { ReactNode } from "react";
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "./ui/AdminTable";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
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
      <div className="p-12 text-center bg-white rounded-xl border border-[#e8edf2] text-slate-500 text-sm shadow-xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <TableContainer>
      <TableHead>
        <tr>
          {columns.map((col, idx) => (
            <TableHeaderCell
              key={idx}
              className={col.className || ""}
              align={col.align || "left"}
            >
              {col.header}
            </TableHeaderCell>
          ))}
        </tr>
      </TableHead>
      <TableBody>
        {data.map((item) => (
          <TableRow key={keyExtractor(item)}>
            {columns.map((col, idx) => (
              <TableCell
                key={idx}
                className={col.className || ""}
                align={col.align || "left"}
              >
                {col.render
                  ? col.render(item)
                  : col.accessor
                  ? String(item[col.accessor] ?? "")
                  : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
}
