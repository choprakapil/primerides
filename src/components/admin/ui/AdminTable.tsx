import React from "react";
import { Inbox } from "lucide-react";

interface AdminTableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function TableContainer({ children, className = "" }: AdminTableContainerProps) {
  return (
    <div className={`card border mb-4 ${className}`}>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            {children}
          </table>
        </div>
      </div>
    </div>
  );
}

export const AdminTable = TableContainer;

export function AdminTableToolbar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3 ${className}`}>
      {children}
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="table-light">
      {children}
    </thead>
  );
}

export const AdminTableHeader = TableHead;

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={className}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {children}
    </tr>
  );
}

export const AdminTableRow = TableRow;

export function TableHeaderCell({
  children,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const alignClass = align === "right" ? "text-end" : align === "center" ? "text-center" : "text-start";
  return (
    <th className={`py-3 px-4 fw-semibold text-muted text-uppercase ${alignClass} ${className}`} style={{ fontSize: "11.5px", letterSpacing: "0.5px" }}>
      {children}
    </th>
  );
}

export const AdminTableHeaderCell = TableHeaderCell;

export function TableCell({
  children,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const alignClass = align === "right" ? "text-end" : align === "center" ? "text-center" : "text-start";
  return (
    <td className={`py-3 px-4 align-middle text-dark ${alignClass} ${className}`} style={{ fontSize: "13px" }}>
      {children}
    </td>
  );
}

export const AdminTableCell = TableCell;

export function AdminTableEmptyState({
  icon,
  title = "No records found",
  description = "There are no matching items in this view.",
  action,
}: {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-5 px-4">
      <div className="avatar avatar-lg rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h6 className="fw-bold text-dark mb-1">{title}</h6>
      <p className="text-muted text-sm mb-3 mx-auto" style={{ maxWidth: "360px" }}>{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
