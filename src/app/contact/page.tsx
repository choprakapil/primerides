"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import TrustBar from "@/components/TrustBar";
import { SITE_CONFIG } from "@/data/siteConfig";

export default function ContactPage() {
  const [settings, setSettings] = useState({
    phone: SITE_CONFIG.phone,
    phoneRaw: SITE_CONFIG.phoneRaw,
    whatsapp: SITE_CONFIG.whatsapp,
    whatsappRaw: SITE_CONFIG.whatsappRaw,
    email: SITE_CONFIG.email,
  });

  useEffect(() => {
    fetch("/api/v1/cms/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && json.data?.site) {
          setSettings((prev) => ({
            ...prev,
            ...json.data.site,
          }));
        }
      })
      .catch((err) => console.error("Error loading contact settings:", err));
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    carType: "7-Seater Innova Crysta / Fortuner",
    pickupCity: "Delhi - IGI Airport T3",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      // 1. Submit lead to database
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setSubmitSuccess("Your inquiry has been successfully recorded in our concierge system! Our team will contact you shortly.");

      // 2. Open WhatsApp for instant chat support
      const text = `*New Car Rental Inquiry*\n• Name: ${formData.name}\n• Phone: ${formData.phone}\n• Car: ${formData.carType}\n• Hub: ${formData.pickupCity}\n• Message: ${formData.message}`;
      const url = `https://api.whatsapp.com/send?phone=${settings.whatsappRaw || "919045301702"}&text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");

      // Reset fields
      setFormData({
        name: "",
        phone: "",
        carType: "7-Seater Innova Crysta / Fortuner",
        pickupCity: "Delhi - IGI Airport T3",
        message: "",
      });
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Contact Primerides"
        subtitle="24/7 Delhi NCR Concierge"
        breadcrumb="Contact"
        bgImage="/assets/img/slider/4.jpg"
      />

      <section className="section-padding section-white">
        <div className="container">
          <div className="row g-5">
            {/* Contact Information & NCR Hubs */}
            <div className="col-lg-5">
              <div className="section-header-block text-start mb-4">
                <span className="section-subtitle-tag">
                  <i className="fa-solid fa-headset"></i> Get In Touch
                </span>
                <h2 className="section-title-large">
                  We are Here To <span>Help You 24/7</span>
                </h2>
                <p>
                  Reach out for instant bookings, corporate fleet contracts, outstation permits, or doorstep delivery requests.
                </p>
              </div>

              <div className="d-flex flex-column gap-4 mb-4">
                <div className="d-flex gap-3 align-items-start">
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "14px",
                      background: "var(--primary-light)",
                      color: "var(--primary-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0,
                    }}
                  >
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Direct Call / WhatsApp</h6>
                    <a href={`tel:${settings.phoneRaw || "+919045301702"}`} className="text-decoration-none fw-bold" style={{ color: "var(--primary-color)" }}>
                      {settings.phone || "+91 90453 01702"}
                    </a>
                    <p className="small text-muted mb-0">Instant responses within 5 minutes</p>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-start">
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "14px",
                      background: "var(--primary-light)",
                      color: "var(--primary-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0,
                    }}
                  >
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Email Support</h6>
                    <a href={`mailto:${settings.email || "info@primerides.in"}`} className="text-decoration-none text-muted">
                      {settings.email || "info@primerides.in"}
                    </a>
                    <p className="small text-muted mb-0">For corporate quotes and invoices</p>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-start">
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "14px",
                      background: "var(--primary-light)",
                      color: "var(--primary-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0,
                    }}
                  >
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">NCR Operating Hubs</h6>
                    <p className="small text-muted mb-1">
                      <strong>Delhi Airport Hub:</strong> Terminal 3 & Aerocity Hub, New Delhi
                    </p>
                    <p className="small text-muted mb-1">
                      <strong>Gurugram Hub:</strong> DLF Cyber City & Golf Course Rd
                    </p>
                    <p className="small text-muted mb-0">
                      <strong>Noida Hub:</strong> Sector 18 Commercial Centre
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Enquiry Form */}
            <div className="col-lg-7">
              <div
                className="p-4 p-md-5 rounded-4 shadow-sm"
                style={{ background: "#f8fafc", border: "1px solid var(--border-color)" }}
              >
                <h4 className="fw-bold mb-2">Send Instant Rental Inquiry</h4>
                <p className="small text-muted mb-4">
                  Fill out your travel requirement below to receive vehicle availability and the best quote directly on WhatsApp.
                </p>

                {submitSuccess && (
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-4 rounded-3 p-3 shadow-sm border-0" style={{ background: "#dcfce7", color: "#166534" }}>
                    <i className="fa-solid fa-circle-check fs-5"></i>
                    <div>
                      <strong>Inquiry Received!</strong> {submitSuccess}
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 rounded-3 p-3 shadow-sm border-0" style={{ background: "#fee2e2", color: "#991b1b" }}>
                    <i className="fa-solid fa-circle-exclamation fs-5"></i>
                    <div>
                      <strong>Submission Error:</strong> {submitError}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="booking-input-group">
                        <label className="booking-input-label">
                          <i className="fa-solid fa-user"></i> Full Name
                        </label>
                        <input
                          type="text"
                          required
                          className="custom-lux-input"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="booking-input-group">
                        <label className="booking-input-label">
                          <i className="fa-solid fa-phone"></i> Phone / WhatsApp
                        </label>
                        <input
                          type="tel"
                          required
                          className="custom-lux-input"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="booking-input-group">
                        <label className="booking-input-label">
                          <i className="fa-solid fa-car"></i> Preferred Vehicle
                        </label>
                        <select
                          className="custom-lux-select"
                          value={formData.carType}
                          onChange={(e) => setFormData({ ...formData, carType: e.target.value })}
                        >
                          <option value="7-Seater Innova Crysta / Fortuner">7-Seater Innova Crysta / Fortuner</option>
                          <option value="Mahindra Thar 4x4 Off-Roader">Mahindra Thar 4x4 Off-Roader</option>
                          <option value="Compact SUV (Creta / Brezza)">Compact SUV (Creta / Brezza)</option>
                          <option value="Economy Hatchback (Swift / Baleno)">Economy Hatchback (Swift / Baleno)</option>
                          <option value="Executive Sedan (Honda City / Verna)">Executive Sedan (Honda City / Verna)</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="booking-input-group">
                        <label className="booking-input-label">
                          <i className="fa-solid fa-map-pin"></i> Handover Hub
                        </label>
                        <select
                          className="custom-lux-select"
                          value={formData.pickupCity}
                          onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                        >
                          <option value="Delhi - IGI Airport T3">Delhi - IGI Airport T3</option>
                          <option value="Delhi - Connaught Place">Delhi - Connaught Place</option>
                          <option value="Gurugram - Cyber City">Gurugram - Cyber City</option>
                          <option value="Noida - Sector 18">Noida - Sector 18</option>
                          <option value="Doorstep Delivery (Home/Hotel)">Doorstep Delivery (Home/Hotel)</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="booking-input-group">
                        <label className="booking-input-label">
                          <i className="fa-solid fa-message"></i> Trip Details / Dates
                        </label>
                        <textarea
                          rows={3}
                          className="custom-lux-input"
                          style={{ height: "auto", minHeight: "100px", resize: "none" }}
                          placeholder="e.g. 5 days trip to Manali from 10th to 15th October, need doorstep delivery at Aerocity."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-12 mt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-prime w-100 d-flex align-items-center justify-content-center gap-2"
                        style={{ border: "none", cursor: isSubmitting ? "not-allowed" : "pointer", padding: "14px", opacity: isSubmitting ? 0.8 : 1 }}
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            <span>Registering Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Inquiry on WhatsApp</span>
                            <i className="fa-brands fa-whatsapp fs-5"></i>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />
    </>
  );
}
