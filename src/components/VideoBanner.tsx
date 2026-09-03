"use client";

import React, { useState } from "react";

export default function VideoBanner() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <section
        className="video-banner-wrap position-relative"
        style={{
          backgroundImage: "url('/assets/img/slider/5.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          padding: "120px 0",
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ background: "rgba(9, 14, 26, 0.75)" }}
        />
        <div className="container position-relative text-center" style={{ zIndex: 10 }}>
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            className="video-play-btn mb-4"
            aria-label="Play Video"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "var(--primary-gradient)",
              border: "none",
              color: "#ffffff",
              fontSize: "24px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 0 0 15px rgba(197, 155, 39, 0.25)",
              transition: "transform 0.3s ease",
            }}
          >
            <i className="fa-solid fa-play" style={{ marginLeft: "4px" }}></i>
          </button>
          <span
            className="d-block text-uppercase fw-bold mb-2"
            style={{ color: "#f7d58b", letterSpacing: "3px", fontSize: "13px" }}
          >
            Experience The Journey
          </span>
          <h2 className="text-white fw-bold mb-3" style={{ fontSize: "40px" }}>
            Clean Cars. Smooth Highways. Unforgettable Memories.
          </h2>
          <p className="text-white-50 mx-auto mb-4" style={{ maxWidth: "650px", fontSize: "16px" }}>
            From scenic mountain getaways in Himachal to smooth high-speed expressways to Rajasthan, experience the real
            thrill of self-drive freedom.
          </p>
          <a href="#categoriesSection" className="btn-prime">
            Book Your Next Journey <i className="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.85)", zIndex: 1070 }}
          onClick={() => setShowVideo(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 pb-0 justify-content-end">
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowVideo(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow-2xl">
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="Primerides Self Drive Experience"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
