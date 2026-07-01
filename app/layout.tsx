import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://shalimarcurries.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Shalimar Curries | Indian Restaurant in Wembley, Perth",
    template: "%s | Shalimar Curries"
  },
  description:
    "Shalimar Curries serves authentic Indian curries, tandoori dishes, biryanis and fresh naan in Wembley, Perth.",
  keywords: [
    "Indian restaurant Wembley",
    "Indian takeaway Perth",
    "Shalimar Curries",
    "Butter chicken Wembley",
    "Indian food Wembley WA"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Shalimar Curries | Indian Restaurant in Wembley, Perth",
    description:
      "Authentic Indian curries, tandoori favourites, biryanis and fresh naan in Wembley WA.",
    url: siteUrl,
    siteName: "Shalimar Curries",
    images: [
      {
        url: "/images/restaurant-spread.webp",
        width: 1200,
        height: 830,
        alt: "Indian dishes served at Shalimar Curries"
      }
    ],
    locale: "en_AU",
    type: "website"
  },
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/favicon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
