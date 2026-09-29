"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface AdminLayoutContextType {
  // Desktop Collapse State
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCollapse: () => void;

  // Mobile Drawer State
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileDrawer: () => void;

  // Backward compatibility aliases
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;

  // Toast System
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

const STORAGE_KEY = "pr_admin_sidebar_collapsed";

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  // Desktop collapsed state (defaults to false on >=1280px, true on 1024-1279px)
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer state (<1024px)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Determine initial collapse state from localStorage or viewport
    const stored = localStorage.getItem(STORAGE_KEY);
    const width = window.innerWidth;

    if (stored !== null) {
      setIsCollapsed(stored === "true");
    } else if (width >= 1024 && width < 1280) {
      // Laptop default: 72px collapsed per spec
      setIsCollapsed(true);
    } else {
      // Wide desktop default: 248px expanded
      setIsCollapsed(false);
    }

    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setIsMobileDrawerOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard accessibility: ESC closes mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileDrawerOpen]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // ignore storage errors
        }
      }
      return next;
    });
  };

  const toggleMobileDrawer = () => setIsMobileDrawerOpen((prev) => !prev);

  const showToast = (message: string, type: Toast["type"] = "success") => {
    const id = `${Date.now()}-${Math.floor(performance.now() * 1000)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AdminLayoutContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleCollapse,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        toggleMobileDrawer,
        // Backward-compatibility aliases
        sidebarOpen: isMobileDrawerOpen,
        setSidebarOpen: setIsMobileDrawerOpen,
        toggleSidebar: toggleMobileDrawer,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error("useAdminLayout must be used within an AdminLayoutProvider");
  }
  return context;
}
