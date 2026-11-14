"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import AuthModal from "@/components/AuthModal";

interface ModalContextType {
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  openBookingModal?: (carName?: string, carPrice?: string, carImg?: string) => void;
  closeBookingModal?: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const closeAuthModal = () => {
    setAuthOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        openAuthModal,
        closeAuthModal,
        openBookingModal: () => {},
        closeBookingModal: () => {},
      }}
    >
      {children}
      <AuthModal isOpen={authOpen} initialMode={authMode} onClose={closeAuthModal} />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
