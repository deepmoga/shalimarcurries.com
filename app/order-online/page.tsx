import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import MenuClient from "./menu-client";

export const metadata: Metadata = {
  title: "Order Online",
  description:
    "Order Indian food online from Shalimar Curries in Wembley. Browse curries, breads, biryani and vegetarian dishes."
};

export default function OrderOnlinePage() {
  return (
    <>
      <SiteHeader />
      <MenuClient />
      <SiteFooter />
    </>
  );
}
