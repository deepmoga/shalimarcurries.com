import type { Metadata } from "next";
import AdminClient from "./admin-client";

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "Manage Shalimar Curries menu categories, products and delivery settings."
};

export default function AdminPage() {
  return <AdminClient />;
}
