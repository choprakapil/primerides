"use client";

import React, { useState } from "react";
import { FAQS_DATA } from "@/data/faqs";
import Link from "next/link";

interface FaqSectionProps {
  showAll?: boolean;
}

export default function FaqSection({ showAll = false }: FaqSectionProps) {
  const [openFaq, setOpenFaq] = useState<string | null>("faq1");

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  const displayedFaqs = showAll ? FAQS_DATA : FAQS_DATA.slice(0, 5);

  return (
    <section className="section-padding section-white" id="faqSection">
      <div className="container">
        <div className="section-header-block">
          <span className="section-subtitle-tag">
            <i className="fa-solid fa-circle-question"></i> Help & Clarity
          </span>
          <h2 className="section-title-large">
            Frequently Asked <span>Questions</span>
          </h2>
          <p>Everything you need to know about deposits, KYC documents, outstation permits, and roadside assistance.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="accordion-custom">
              {displayedFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="faq-item mb-3 rounded-4 overflow-hidden"
                    style={{
                      border: "1px solid var(--border-color)",
                      background: isOpen ? "#fdfaf2" : "#ffffff",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <button
                      type="button"
                      className="w-100 p-4 text-start d-flex justify-content-between align-items-center bg-transparent border-0"
                      onClick={() => toggleFaq(faq.id)}
                      style={{ cursor: "pointer", fontWeight: 700, fontSize: "16px", color: "var(--text-heading)" }}
                    >
                      <span>{faq.question}</span>
                      <i
                        className={`fa-solid fa-chevron-${isOpen ? "up" : "down"} ms-3`}
                        style={{ color: "var(--primary-color)", fontSize: "14px", transition: "transform 0.3s ease" }}
                      ></i>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4" style={{ color: "var(--text-body)", fontSize: "14px", lineHeight: 1.7 }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!showAll && (
              <div className="text-center mt-4">
                <Link href="/faq" className="btn-prime-outline">
                  View Full FAQ & Policies <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
