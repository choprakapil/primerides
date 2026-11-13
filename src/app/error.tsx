"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Page Error Boundary]:", error);
    Sentry.captureException(error);
  }, [error]);

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
          background: "radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div className="container position-relative text-center" style={{ zIndex: 2, maxWidth: "650px" }}>
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
          System Notice • Temporary Issue
        </span>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            margin: "0 0 16px",
            color: "#ffffff",
          }}
        >
          Something Went Off Course
        </h1>

        <p style={{ fontSize: "16px", color: "#94a3b8", lineHeight: 1.7, marginBottom: "32px" }}>
          We encountered an unexpected error while processing your mobility request. Our engineering team has been notified.
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-prime"
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
              border: "none",
            }}
          >
            <i className="fa-solid fa-rotate-right me-2"></i> Try Again
          </button>

          <Link
            href="/"
            className="btn btn-outline-light"
            style={{
              padding: "14px 28px",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
            }}
          >
            Return to Homepage
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
