"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import AuthModal from "@/components/AuthModal";
import BookingModal from "@/components/BookingModal";

interface BookingCarData {
  name: string;
  price: string;
  img: string;
}

interface ModalContextType {
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  openBookingModal: (carName: string, carPrice: string, carImg: string) => void;
  closeBookingModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingCar, setBookingCar] = useState<BookingCarData>({
    name: "Toyota Fortuner 4x4",
    price: "5999",
    img: "/assets/img/cars/1.jpg",
  });

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const closeAuthModal = () => {
    setAuthOpen(false);
  };

  const openBookingModal = (carName: string, carPrice: string, carImg: string) => {
    setBookingCar({ name: carName, price: carPrice, img: carImg });
    setBookingOpen(true);
  };

  const closeBookingModal = () => {
    setBookingOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        openAuthModal,
        closeAuthModal,
        openBookingModal,
        closeBookingModal,
      }}
    >
      {children}
      <AuthModal isOpen={authOpen} initialMode={authMode} onClose={closeAuthModal} />
      <BookingModal
        isOpen={bookingOpen}
        carName={bookingCar.name}
        carPrice={bookingCar.price}
        carImg={bookingCar.img}
        onClose={closeBookingModal}
      />
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
