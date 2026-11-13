"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Printer, Check } from "lucide-react";

interface InvoicePrintActionsProps {
  bookingId: number;
  bookingCode: string;
}

export default function InvoicePrintActions({
  bookingId,
  bookingCode,
}: InvoicePrintActionsProps) {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: #ffffff !important;
            padding: 0 !important;
          }
          #invoice-paper {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="no-print d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <Link
          href="/account/bookings"
          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </Link>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-outline-dark btn-sm d-inline-flex align-items-center gap-1.5 px-3"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <a
            href={`/api/v1/bookings/${bookingId}/invoice`}
            download={`Invoice-${bookingCode.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`}
            onClick={() => {
              setDownloading(true);
              setTimeout(() => setDownloading(false), 2500);
            }}
            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 px-3"
            style={{ backgroundColor: "#c59b27", borderColor: "#c59b27" }}
          >
            {downloading ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloading PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Official PDF</span>
              </>
            )}
          </a>
        </div>
      </div>
    </>
  );
}
