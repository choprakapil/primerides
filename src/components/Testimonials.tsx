import React from "react";
import { TESTIMONIALS_DATA } from "@/data/faqs";

export default function Testimonials() {
  return (
    <section className="section-padding section-white">
      <div className="container">
        <div className="section-header-block">
          <span className="section-subtitle-tag">
            <i className="fa-solid fa-star"></i> Traveler Experiences
          </span>
          <h2 className="section-title-large">
            Trusted By <span>10,000+ Explorers</span>
          </h2>
          <p>Read real stories from road-trippers who explored India with Primerides self-drive vehicles.</p>
        </div>

        <div className="row g-4">
          {TESTIMONIALS_DATA.map((t, idx) => (
            <div key={idx} className="col-lg-4 col-md-6">
              <div
                className="p-4 rounded-4 h-100 d-flex flex-column"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--border-color)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                }}
              >
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={t.img}
                    alt={t.name}
                    style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ fontSize: "16px" }}>
                      {t.name}
                    </h5>
                    <small className="text-muted">{t.trip}</small>
                  </div>
                </div>
                <div className="mb-3 d-flex gap-1 text-warning" style={{ fontSize: "14px" }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <i key={i} className="fa-solid fa-star" style={{ color: "var(--primary-color)" }}></i>
                  ))}
                </div>
                <p className="small mb-4" style={{ color: "var(--text-body)", lineHeight: 1.7 }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                  <span className="badge bg-light text-dark border">
                    <i className="fa-solid fa-car me-1 text-muted"></i> {t.car}
                  </span>
                  <span className="small text-success fw-bold">
                    <i className="fa-solid fa-circle-check me-1"></i> Verified Trip
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
