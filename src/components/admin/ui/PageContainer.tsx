import React from "react";

interface AdminPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminPageContainer({ children, className = "" }: AdminPageContainerProps) {
  return (
    <div className={`w-100 py-2 ${className}`}>
      {children}
    </div>
  );
}

export const PageContainer = AdminPageContainer;
export default AdminPageContainer;
