import type { Metadata, Viewport } from "next";
import "./globals.css";
import "motion-icons-react/style.css";
import { ModalProvider } from "@/context/ModalContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

export const viewport: Viewport = {
  themeColor: "#090e1a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://primerides-taupe.vercel.app"),
  title: {
    default: "PrimeRides™ | Premium Self-Drive Car Rental Delhi NCR & Lucknow",
    template: "%s | PrimeRides™",
  },
  description:
    "Rent 50+ luxury sedans, 4x4 SUVs (Fortuner 4x4, Thar, Innova Crysta, Creta) with unlimited kilometers, zero hidden fees, and instant 24/7 doorstep & IGI Airport T1/T2/T3 delivery across Delhi NCR & Lucknow.",
  keywords: [
    "Self Drive Car Rental Delhi",
    "Self Drive Car Rental Lucknow",
    "Car Rental IGI Airport Delhi T3",
    "Mahindra Thar Self Drive Delhi",
    "Toyota Fortuner 4x4 Rental",
    "Innova Crysta Rental Delhi NCR",
    "Unlimited KM Self Drive Car",
    "Luxury Car Rental Delhi",
  ],
  authors: [{ name: "PrimeRides India", url: "https://primerides-taupe.vercel.app" }],
  creator: "PrimeRides",
  publisher: "PrimeRides",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://primerides-taupe.vercel.app",
    siteName: "PrimeRides™",
    title: "PrimeRides™ | Premium Self-Drive Car Rental Delhi NCR & Lucknow",
    description:
      "Explore 50+ self-drive luxury cars & 4x4 SUVs. Unlimited KMs • Zero Hidden Charges • 15-min Curbside Airport Delivery at Delhi IGI Airport & CCS Lucknow.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PrimeRides Luxury Self-Drive Cars Fleet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrimeRides™ | Premium Self-Drive Car Rental Delhi NCR & Lucknow",
    description:
      "Rent Fortuner 4x4, Thar, Innova Crysta & luxury cars with unlimited KMs and 24/7 doorstep airport delivery.",
    images: ["/og-image.jpg"],
    creator: "@primerides",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <meta property="og:image" content="https://primerides-taupe.vercel.app/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/plugins.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body>
        <ModalProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ModalProvider>
        <Analytics />
      </body>
    </html>
  );
}
