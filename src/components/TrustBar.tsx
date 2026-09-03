import React from "react";

const TRUST_ITEMS = [
  {
    icon: "fa-solid fa-gauge-high",
    title: "Unlimited Kilometers",
    desc: "No per-km limits or hidden penalties",
  },
  {
    icon: "fa-solid fa-location-crosshairs",
    title: "Doorstep Delivery",
    desc: "To any home, office, or airport terminal in NCR",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "Zero Hidden Fees",
    desc: "100% transparent pricing & minimal security deposit",
  },
  {
    icon: "fa-solid fa-headset",
    title: "24/7 Roadside Assistance",
    desc: "Round-the-clock emergency support across India",
  },
];

export default function TrustBar() {
  return (
    <div className="section-alt" style={{ padding: "40px 0", borderBottom: "1px solid var(--border-color)" }}>
      <div className="container">
        <div className="row g-4">
          {TRUST_ITEMS.map((item, idx) => (
            <div key={idx} className="col-lg-3 col-md-6">
              <div className="trust-item d-flex align-items-center gap-3">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(198, 159, 70, 0.12)",
                    color: "var(--primary-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  <i className={item.icon}></i>
                </div>
                <div>
                  <h6 className="mb-1 fw-bold" style={{ color: "var(--text-heading)", fontSize: "15px" }}>
                    {item.title}
                  </h6>
                  <p className="mb-0 text-muted" style={{ fontSize: "13px", lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
