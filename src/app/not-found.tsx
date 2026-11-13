import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <section
      className="d-flex align-items-center justify-content-center min-vh-100 position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #090e1a 0%, #0f172a 50%, #1e293b 100%)",
        color: "#ffffff",
        padding: "120px 20px 80px",
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(197, 155, 39, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div className="container position-relative text-center" style={{ zIndex: 2, maxWidth: "680px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "8px 20px",
            borderRadius: "50px",
            background: "rgba(197, 155, 39, 0.18)",
            border: "1px solid rgba(197, 155, 39, 0.4)",
            color: "#f7d58b",
            fontWeight: 700,
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: "24px",
          }}
        >
          404 Error • Off Track
        </span>

        <h1
          style={{
            fontSize: "clamp(3.5rem, 8vw, 6.5rem)",
            fontWeight: 900,
            lineHeight: 1,
            margin: "0 0 16px",
            background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, var(--primary-color, #c59b27) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-2px",
          }}
        >
          404
        </h1>

        <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "16px", color: "#f8fafc" }}>
          Destination Not Found
        </h2>

        <p style={{ fontSize: "16px", color: "#94a3b8", lineHeight: 1.7, marginBottom: "36px" }}>
          The road you are navigating does not exist or has been relocated. Return to your planned route or connect with our concierge desk.
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Link
            href="/"
            className="btn-prime"
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
            }}
          >
            Return to Homepage &rarr;
          </Link>

          <Link
            href="/cars"
            className="btn btn-outline-light"
            style={{
              padding: "14px 28px",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
            }}
          >
            Explore Fleet
          </Link>

          <Link
            href="/contact"
            className="btn btn-outline-light"
            style={{
              padding: "14px 28px",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
            }}
          >
            Contact Desk
          </Link>
        </div>
      </div>
    </section>
  );
}
