import type { Metadata } from "next";
import Script from "next/script";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { recaptchaSiteKey } from "@/lib/recaptcha-config";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout for Shalimar Curries online orders."
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <CheckoutClient recaptchaSiteKey={recaptchaSiteKey} />
      <Script src="https://www.google.com/recaptcha/api.js" strategy="afterInteractive" />
      <SiteFooter />
    </>
  );
}
