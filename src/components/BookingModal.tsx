"use client";

import React, { useState } from "react";

interface BookingModalProps {
  isOpen: boolean;
  carName: string;
  carPrice: string;
  carImg: string;
  onClose: () => void;
}

export default function BookingModal({
  isOpen,
  carName,
  carPrice,
  carImg,
  onClose,
}: BookingModalProps) {
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custLoc, setCustLoc] = useState("Delhi - IGI Airport Terminal 3");
  const [custStart, setCustStart] = useState("2026-09-03");
  const [custEnd, setCustEnd] = useState("2026-09-06");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const waText = encodeURIComponent(
      `Hello Primerides! I want to book the ${carName} from ${custStart} to ${custEnd}. Pickup Location: ${custLoc}. Name: ${custName}, Phone: ${custPhone}`
    );
    window.open(`https://api.whatsapp.com/send?phone=919045301702&text=${waText}`, "_blank");
    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ background: "rgba(0,0,0,0.75)", zIndex: 1060 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content modal-content-lux" style={{ borderRadius: "24px", overflow: "hidden" }}>
          <div
            className="modal-header modal-header-lux"
            style={{
              background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
              padding: "22px 28px",
            }}
          >
            <div>
              <span
                className="badge bg-warning text-dark fw-bold mb-1"
                style={{ background: "var(--primary-gradient) !important", color: "#fff !important" }}
              >
                Primerides Instant Reservation
              </span>
              <h4 className="modal-title text-white mb-0">{carName}</h4>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-4 p-md-5" style={{ background: "#ffffff" }}>
            <div className="row g-4 align-items-center">
              <div className="col-md-5">
                <div className="rounded-4 overflow-hidden shadow-sm border mb-3">
                  <img
                    src={carImg || "/assets/img/cars/1.jpg"}
                    alt={carName}
                    className="img-fluid w-100"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                </div>
                <div
                  className="p-3 rounded-4 border text-center"
                  style={{ background: "#fdfaf2", borderColor: "rgba(197, 155, 39, 0.3) !important" }}
                >
                  <span className="text-muted small d-block">Base Daily Tariff</span>
                  <span className="fs-4 fw-bold" style={{ color: "var(--primary-color)" }}>
                    ₹{parseInt(carPrice || "3499").toLocaleString("en-IN")} / day
                  </span>
                </div>
              </div>
              <div className="col-md-7">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">Your Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Rahul Sharma"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">WhatsApp / Mobile Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+91 98765 43210"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">From (Pick-up Hub in Delhi NCR)</label>
                      <select
                        className="form-select"
                        value={custLoc}
                        onChange={(e) => setCustLoc(e.target.value)}
                        required
                      >
                        <option>Delhi - IGI Airport Terminal 3</option>
                        <option>Delhi - IGI Airport Terminal 1 & 2</option>
                        <option>Gurugram - Cyber City Hub</option>
                        <option>Delhi - Connaught Place</option>
                        <option>Noida - Sector 18</option>
                        <option>Doorstep Delivery (Home/Office/Hotel)</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Pick-up Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={custStart}
                        onChange={(e) => setCustStart(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Return Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={custEnd}
                        onChange={(e) => setCustEnd(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn-prime w-100 mt-2"
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        <i className="fa-brands fa-whatsapp"></i> Confirm & Connect on WhatsApp
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
