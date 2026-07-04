import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Mail,
  MapPin,
  Menu,
  Phone,
  Share2,
  Utensils
} from "lucide-react";
import { siteContent } from "@/content/home";

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
              <Share2 size={15} aria-hidden="true" />
            </a>
            <a href={business.instagram} aria-label="Instagram">
              <Camera size={15} aria-hidden="true" />
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
              <Share2 size={18} aria-hidden="true" />
            </a>
            <a href={business.instagram} aria-label="Instagram">
              <Camera size={18} aria-hidden="true" />
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
        <span>Built with Next.js</span>
      </div>
    </footer>
  );
}
