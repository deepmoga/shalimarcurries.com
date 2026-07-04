import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Menu,
  Phone,
  Utensils
} from "lucide-react";
import { siteContent } from "@/content/home";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 8.4V6.6c0-.78.18-1.2 1.06-1.2H17V2h-3.02c-3.14 0-4.24 1.55-4.24 4.16V8.4H7.5V12h2.24v10H14V12h2.86l.38-3.6H14Z" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.25" cy="6.75" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function SiteHeader() {
  const { business, nav } = siteContent;

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <a href={business.mapUrl} className="topbar-link">
            <MapPin size={15} aria-hidden="true" />
            <span>{business.address}</span>
          </a>
          <a href={`mailto:${business.email}`} className="topbar-link">
            <Mail size={15} aria-hidden="true" />
            <span>{business.email}</span>
          </a>
          <div className="topbar-social">
            <a href={business.facebook} aria-label="Facebook">
              <FacebookIcon size={15} />
            </a>
            <a href={business.instagram} aria-label="Instagram">
              <InstagramIcon size={15} />
            </a>
          </div>
        </div>
      </div>
      <div className="nav-shell">
        <div className="container nav-inner">
          <Link className="brand" href="/" aria-label="Shalimar Curries home">
            <Image src="/images/logo.png" width={354} height={79} alt="Shalimar Curries" />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map((item) => (
              <Link href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>
          <a className="button button-light nav-cta" href={business.orderUrl}>
            <Utensils size={16} aria-hidden="true" />
            <span>Order Online</span>
          </a>
          <details className="mobile-menu">
            <summary aria-label="Open menu">
              <Menu size={24} aria-hidden="true" />
            </summary>
            <div className="mobile-menu-panel">
              {nav.map((item) => (
                <Link href={item.href} key={item.label}>
                  {item.label}
                </Link>
              ))}
              <a className="button button-light" href={business.orderUrl}>
                <Utensils size={16} aria-hidden="true" />
                <span>Order Online</span>
              </a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function PageHero({
  title,
  text,
  image
}: {
  title: string;
  text?: string;
  image: string;
}) {
  return (
    <section className="page-hero">
      <Image src={image} alt="" fill sizes="100vw" className="page-hero-image" priority />
      <div className="page-hero-overlay" />
      <div className="container page-hero-content">
        <h1>{title}</h1>
        {text ? <p>{text}</p> : null}
      </div>
    </section>
  );
}

export function SiteFooter() {
  const { business, nav } = siteContent;
  const facebookPluginUrl = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    business.facebook
  )}&tabs=timeline&width=360&height=260&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

  return (
    <footer className="site-footer" id="contact">
      <div className="container footer-grid">
        <div>
          <Image src="/images/logo.png" width={250} height={56} alt="Shalimar Curries" />
          <p>
            Shalimar Curries in Wembley, WA offers authentic Indian cuisine, rich
            curries and warm hospitality, bringing the true taste of India to Perth.
          </p>
          <div className="footer-social">
            <a href={business.facebook} aria-label="Facebook">
              <FacebookIcon size={18} />
            </a>
            <a href={business.instagram} aria-label="Instagram">
              <InstagramIcon size={18} />
            </a>
          </div>
        </div>
        <div>
          <h2>Quick Menu</h2>
          <ul>
            {nav.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Contact Us</h2>
          <ul className="footer-contact">
            <li>
              <Phone size={17} aria-hidden="true" />
              <a href={`tel:${business.phone.replaceAll(" ", "")}`}>{business.phone}</a>
            </li>
            <li>
              <Mail size={17} aria-hidden="true" />
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </li>
            <li>
              <MapPin size={17} aria-hidden="true" />
              <a href={business.mapUrl}>{business.address}</a>
            </li>
          </ul>
        </div>
        <div className="facebook-page-card">
          <iframe
            title="Shalimar Curries Wembley Facebook page"
            src={facebookPluginUrl}
            width="360"
            height="260"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Copyright (c) 2026 Shalimar Curries. All rights reserved.</span>
        <span>
          Made with love by{" "}
          <a href="https://officialdigitalmarketing.in/" target="_blank" rel="noreferrer">
            Official Digital Marketing
          </a>
        </span>
      </div>
    </footer>
  );
}
