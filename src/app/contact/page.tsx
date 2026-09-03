"use client";

import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import TrustBar from "@/components/TrustBar";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    carType: "7-Seater Innova Crysta / Fortuner",
    pickupCity: "Delhi - IGI Airport T3",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `*New Car Rental Inquiry*\n• Name: ${formData.name}\n• Phone: ${formData.phone}\n• Car: ${formData.carType}\n• Hub: ${formData.pickupCity}\n• Message: ${formData.message}`;
    const url = `https://api.whatsapp.com/send?phone=919045301702&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
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
                    <a href="tel:+919045301702" className="text-decoration-none fw-bold" style={{ color: "var(--primary-color)" }}>
                      +91 90453 01702
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
                    <a href="mailto:info@primerides.in" className="text-decoration-none text-muted">
                      info@primerides.in
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
                      <button type="submit" className="btn-prime w-100" style={{ border: "none", cursor: "pointer", padding: "14px" }}>
                        Send Inquiry on WhatsApp <i className="fa-brands fa-whatsapp ms-2"></i>
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
