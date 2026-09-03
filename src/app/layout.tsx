import type { Metadata } from "next";
import "./globals.css";
import "motion-icons-react/style.css";
import { ModalProvider } from "@/context/ModalContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Primerides - Self Drive Car Rental Delhi NCR | Unlimited KMs & Doorstep Delivery",
  description:
    "Book self-drive cars in Delhi, Gurgaon, Noida, Ghaziabad & Faridabad with Primerides. Enjoy unlimited kilometers, zero hidden charges, doorstep delivery, and 24/7 roadside assistance.",
  icons: {
    icon: "/assets/img/PRLogo.png",
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
