"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log uncaught root error to Sentry APM
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">
            System Failure
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            A critical application error has occurred. Our engineering team has been notified via automatic diagnostic telemetry.
          </p>
          {error.digest && (
            <div className="text-xs font-mono bg-slate-950 p-2 rounded text-slate-500 mb-6 truncate">
              Incident Ref: {error.digest}
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition cursor-pointer"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
