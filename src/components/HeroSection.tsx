"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useModal } from "@/context/ModalContext";

const SLIDES = [
  {
    id: 1,
    image: "/assets/img/slider/1.jpg",
    pillIcon: "fa-solid fa-road",
    pillText: "Self Drive Car Rental Delhi NCR",
    title: "Drive Your Way Across Delhi NCR",
    subtext: "Unlimited KMs • Clean Fleet Starting From",
    price: "₹1,499",
    btn1Text: "Explore Categories",
    btn1Href: "/cars",
    btn1Icon: "fa-solid fa-arrow-right",
    btn2Text: "Book Fortuner 4x4",
    btn2Action: true,
    carName: "Toyota Fortuner 4x4",
    carPrice: "5999",
    carImg: "/assets/img/cars/1.jpg",
  },
  {
    id: 2,
    image: "/assets/img/slider/2.jpg",
    pillIcon: "fa-solid fa-mountain",
    pillText: "Mountain & Off-Road Expeditions",
    title: "Mahindra Thar 4x4 & Fortuner",
    subtext: "Conquer Himachal & Uttarakhand Starting From",
    price: "₹3,499",
    btn1Text: "View 4x4 Category",
    btn1Href: "/cars?filter=adventure",
    btn1Icon: "fa-solid fa-arrow-right",
    btn2Text: "Call +91 90453 01702",
    btn2Href: "tel:+919045301702",
    btn2Icon: "fa-solid fa-phone",
  },
  {
    id: 3,
    image: "/assets/img/slider/3.jpg",
    pillIcon: "fa-solid fa-users",
    pillText: "Spacious Family & Group Touring",
    title: "Toyota Innova Crysta 7-Seater",
    subtext: "Executive Comfort & FASTag Enabled Starting From",
    price: "₹4,200",
    btn1Text: "View 7-Seater SUVs",
    btn1Href: "/cars?filter=suv",
    btn1Icon: "fa-solid fa-arrow-right",
    btn2Text: "Estimate Tariff",
    btn2Href: "#priceEstimator",
    btn2Icon: "fa-solid fa-calculator",
  },
  {
    id: 4,
    image: "/assets/img/slider/4.jpg",
    pillIcon: "fa-solid fa-plane-arrival",
    pillText: "IGI Airport T1, T2 & T3 Delivery",
    title: "Instant Airport Terminal Handover",
    subtext: "Fast Digital KYC & Doorstep Drop Starting From",
    price: "₹2,999",
    btn1Text: "Book Airport Delivery",
    btn1Action: true,
    carName: "Hyundai Creta SX(O)",
    carPrice: "2999",
    carImg: "/assets/img/cars/2.jpg",
    btn1Icon: "fa-solid fa-arrow-right",
    btn2Text: "All Categories",
    btn2Href: "/cars",
    btn2Icon: "fa-solid fa-layer-group",
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { openBookingModal } = useModal();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <header
      className="header slider-fade position-relative overflow-hidden"
      style={{
        height: "100vh",
        minHeight: "740px",
        background: "#090e1a",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Background Slides Crossfade */}
      {SLIDES.map((s, index) => (
        <div
          key={s.id}
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url('${s.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: index === currentSlide ? 1 : 0,
            transition: "opacity 1.0s cubic-bezier(0.16, 1, 0.3, 1)",
            zIndex: 1,
          }}
        >
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background:
                "linear-gradient(90deg, rgba(9, 14, 26, 0.92) 0%, rgba(9, 14, 26, 0.65) 52%, rgba(9, 14, 26, 0.3) 100%)",
            }}
          />
        </div>
      ))}

      {/* Main Single Active Caption Container */}
      <div className="container position-relative" style={{ zIndex: 10, paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="row">
          <div className="col-lg-9 col-md-11">
            <div className="caption">
              <div className="hero-pill">
                <i className={slide.pillIcon}></i> {slide.pillText}
              </div>
              <h1 style={{ color: "#ffffff", marginBottom: "20px", textShadow: "0 4px 25px rgba(0, 0, 0, 0.4)" }}>
                {slide.title}
              </h1>
              <div className="hero-price">
                {slide.subtext} <span>{slide.price}</span> / day
              </div>
              <div className="d-flex flex-wrap gap-3">
                {slide.btn1Action ? (
                  <button
                    type="button"
                    onClick={() => openBookingModal(slide.carName!, slide.carPrice!, slide.carImg!)}
                    className="btn-prime"
                    style={{ border: "none", cursor: "pointer" }}
                  >
                    {slide.btn1Text} <i className={slide.btn1Icon}></i>
                  </button>
                ) : (
                  <Link href={slide.btn1Href!} className="btn-prime">
                    {slide.btn1Text} <i className={slide.btn1Icon}></i>
                  </Link>
                )}

                {slide.btn2Action ? (
                  <button
                    type="button"
                    onClick={() => openBookingModal(slide.carName!, slide.carPrice!, slide.carImg!)}
                    className="btn-prime-outline hero-btn-outline"
                    style={{
                      background: "rgba(255, 255, 255, 0.12)",
                      borderColor: "rgba(255, 255, 255, 0.4)",
                      color: "#ffffff",
                      border: "1.5px solid rgba(255, 255, 255, 0.4)",
                      cursor: "pointer",
                      textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    <span style={{ color: "#ffffff", fontWeight: 600 }}>{slide.btn2Text}</span>
                    <i className="fa-solid fa-car-side ms-2" style={{ color: "#ffffff" }}></i>
                  </button>
                ) : slide.btn2Href ? (
                  <a
                    href={slide.btn2Href}
                    className="btn-prime-outline hero-btn-outline"
                    style={{
                      background: "rgba(255, 255, 255, 0.12)",
                      borderColor: "rgba(255, 255, 255, 0.4)",
                      color: "#ffffff",
                      border: "1.5px solid rgba(255, 255, 255, 0.4)",
                      textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    <span style={{ color: "#ffffff", fontWeight: 600 }}>{slide.btn2Text}</span>
                    <i className={`${slide.btn2Icon} ms-2`} style={{ color: "#ffffff" }}></i>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Pagination Dots */}
      <div
        className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-2 pb-4"
        style={{ zIndex: 12, marginBottom: "80px" }}
      >
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            style={{
              width: idx === currentSlide ? "28px" : "10px",
              height: "10px",
              borderRadius: "5px",
              background: idx === currentSlide ? "var(--primary-color)" : "rgba(255,255,255,0.45)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </header>
  );
}
