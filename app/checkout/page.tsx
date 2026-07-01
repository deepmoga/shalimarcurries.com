import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout for Shalimar Curries online orders."
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <CheckoutClient />
      <SiteFooter />
    </>
  );
}
