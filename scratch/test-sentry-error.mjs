import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Sentry = require("@sentry/nextjs");

console.log("Testing Sentry initialization and captureException...");

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  tracesSampleRate: 1.0,
  debug: false,
  beforeSend(event) {
    console.log("Sentry beforeSend intercepted event:", {
      event_id: event.event_id,
      exception: event.exception?.values?.[0]?.value,
      type: event.exception?.values?.[0]?.type,
      level: event.level,
    });
    return null; // Don't actually send network request to dummy DSN
  },
});

const testError = new Error("Simulated unhandled exception for APM verification");
const eventId = Sentry.captureException(testError);

console.log("Sentry captureException completed successfully. Event ID:", eventId);
if (eventId) {
  console.log("VERIFICATION SUCCESS: Sentry APM error pipeline is active and intercepting exceptions.");
  process.exit(0);
} else {
  console.error("VERIFICATION FAILED: No event ID returned.");
  process.exit(1);
}
