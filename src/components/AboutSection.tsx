import React from "react";

const STATS = [
  { value: "50+", label: "Company Owned Cars" },
  { value: "10,000+", label: "Trips Completed" },
  { value: "4.9 ★", label: "Google Review Rating" },
  { value: "24/7", label: "RSA & Support" },
];

export default function AboutSection() {
  return (
    <section className="section-padding section-alt" id="aboutSection">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <div className="about-img-wrap position-relative">
              <div className="rounded-4 overflow-hidden shadow-lg border">
                <img
                  src="/assets/img/cars/1.jpg"
                  alt="Primerides Self Drive Fleet"
                  className="img-fluid w-100"
                  style={{ minHeight: "360px", objectFit: "cover" }}
                />
              </div>
              <div
                className="position-absolute bottom-0 start-0 m-4 p-3 rounded-4 shadow-lg d-none d-sm-flex align-items-center gap-3"
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(197, 155, 39, 0.3)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "var(--primary-gradient)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-dark">10,000+ Happy Journeys</h6>
                  <small className="text-muted">Top Rated in Delhi NCR</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <span className="section-subtitle-tag">
              <i className="fa-solid fa-circle-info"></i> Delhi NCR Self-Drive Pioneer
            </span>
            <h2 className="section-title-large">
              Why Drivers Prefer <span>Primerides</span>
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: "16px", lineHeight: 1.8 }}>
              Primerides is Delhi NCR's dedicated self-drive car rental platform built on three principles: total vehicle
              hygiene, transparent fixed tariffs, and true freedom on the open road.
            </p>

            <div className="row g-3 mb-4">
              {STATS.map((s, idx) => (
                <div key={idx} className="col-6">
                  <div
                    className="p-3 rounded-4 border bg-white text-center"
                    style={{ borderColor: "rgba(197, 155, 39, 0.2) !important" }}
                  >
                    <h4 className="fw-bold mb-1" style={{ color: "var(--primary-color)" }}>
                      {s.value}
                    </h4>
                    <span className="text-muted small fw-medium">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex flex-wrap gap-3">
              <a href="#categoriesSection" className="btn-prime">
                Explore Our Fleet <i className="fa-solid fa-arrow-right"></i>
              </a>
              <a href="tel:+919045301702" className="btn-prime-outline">
                <i className="fa-solid fa-phone"></i> +91 90453 01702
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
