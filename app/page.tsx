import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Car,
  Camera,
  ChefHat,
  Clock,
  Gift,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils
} from "lucide-react";
import { siteContent } from "@/content/home";

const featureIcons = [ChefHat, Car, Leaf, ShieldCheck];

export default function Home() {
  const { business, nav, hero, intro, dishes, features, booking, banner, reviews } =
    siteContent;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: business.name,
    image: "https://shalimarcurries.com/images/restaurant-spread.webp",
    servesCuisine: "Indian",
    priceRange: "$$",
    telephone: business.phone,
    email: business.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "338 Cambridge St",
      addressLocality: "Wembley",
      addressRegion: "WA",
      postalCode: "6014",
      addressCountry: "AU"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.4",
      reviewCount: "278"
    },
    url: "https://shalimarcurries.com"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
              <Image
                src="/images/logo.png"
                width={354}
                height={79}
                alt="Shalimar Curries"
                priority
              />
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

      <main>
        <section className="hero-section">
          <Image
            src={hero.image}
            alt="Fresh Indian curry at Shalimar Curries"
            fill
            sizes="100vw"
            className="hero-image"
            priority
          />
          <div className="hero-overlay" />
          <div className="container hero-content">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p>{hero.text}</p>
            <div className="hero-actions">
              <a className="button button-gold" href={business.orderUrl}>
                <Utensils size={18} aria-hidden="true" />
                <span>{hero.primaryCta}</span>
              </a>
              <a className="button button-outline" href="#reserve">
                <CalendarDays size={18} aria-hidden="true" />
                <span>{hero.secondaryCta}</span>
              </a>
            </div>
          </div>
        </section>

        <section className="section intro-section" id="about">
          <div className="container split-grid">
            <div className="image-panel">
              <Image
                src={intro.image}
                width={900}
                height={623}
                alt="Assorted Indian dishes at Shalimar Curries"
                sizes="(max-width: 900px) 100vw, 48vw"
              />
            </div>
            <div className="content-panel">
              <p className="eyebrow dark">{intro.eyebrow}</p>
              <h2>{intro.title}</h2>
              <p>{intro.text}</p>
              <div className="stats-row">
                {intro.stats.map((stat) => (
                  <div className="stat" key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section menu-preview" id="menu">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow dark">Popular dishes</p>
              <h2>Customer favourite Indian curries</h2>
              <p>Freshly cooked favourites from the Shalimar kitchen.</p>
            </div>
            <div className="dish-grid">
              {dishes.map((dish) => (
                <article className="dish-card" key={dish.name}>
                  <Image
                    src={dish.image}
                    width={600}
                    height={360}
                    alt={dish.name}
                    sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  />
                  <div className="dish-card-body">
                    <h3>{dish.name}</h3>
                    <p>{dish.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="center-actions">
              <a className="button button-green" href={business.orderUrl}>
                <Utensils size={17} aria-hidden="true" />
                <span>Order Now</span>
              </a>
            </div>
          </div>
        </section>

        <section className="section why-section">
          <div className="container why-grid">
            <div>
              <p className="eyebrow dark">Why choose us</p>
              <h2>Why locals love {business.shortName} Curries</h2>
              <p>
                A cosy Wembley restaurant for dine-in, takeaway and generous Indian
                flavours made with care.
              </p>
            </div>
            <div className="feature-grid">
              {features.map((feature, index) => {
                const Icon = featureIcons[index] ?? Sparkles;
                return (
                  <article className="feature" key={feature.title}>
                    <Icon size={30} aria-hidden="true" />
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section reserve-section" id="reserve">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow dark">Reservations</p>
              <h2>{booking.title}</h2>
              <p>{booking.text}</p>
            </div>
            <div className="reserve-grid">
              <aside className="event-panel">
                <p className="eyebrow">Reservation by phone</p>
                <h3>{booking.eventTitle}</h3>
                <p>{booking.eventText}</p>
                <div className="contact-stack">
                  <a href={`tel:${business.phone.replaceAll(" ", "")}`}>
                    <Phone size={22} aria-hidden="true" />
                    <span>
                      <small>Call now</small>
                      {business.phone}
                    </span>
                  </a>
                  <a href={`mailto:${business.email}`}>
                    <Mail size={22} aria-hidden="true" />
                    <span>
                      <small>Mail us</small>
                      {business.email}
                    </span>
                  </a>
                </div>
              </aside>
              <form className="booking-form" action="/api/reservations" method="post">
                <label>
                  <span>Name</span>
                  <input name="name" type="text" placeholder="Name" required />
                </label>
                <label>
                  <span>Phone</span>
                  <input name="phone" type="tel" placeholder="Phone" required />
                </label>
                <label>
                  <span>Email</span>
                  <input name="email" type="email" placeholder="Email" />
                </label>
                <label>
                  <span>Date</span>
                  <input name="date" type="date" required />
                </label>
                <label>
                  <span>Time</span>
                  <input name="time" type="time" required />
                </label>
                <label>
                  <span>Person(s)</span>
                  <input name="people" type="number" min="1" placeholder="2" required />
                </label>
                <label className="full-field">
                  <span>Message</span>
                  <textarea name="message" placeholder="Message" rows={5} />
                </label>
                <button className="button button-green full-field" type="submit">
                  <CalendarDays size={17} aria-hidden="true" />
                  <span>Book a Table</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="banner-section">
          <Image
            src={banner.image}
            width={1400}
            height={920}
            alt="Butter chicken from Shalimar Curries"
            className="banner-image"
            sizes="(max-width: 900px) 100vw, 48vw"
          />
          <div className="container banner-content">
            <div>
              <p className="eyebrow">{banner.eyebrow}</p>
              <h2>{banner.title}</h2>
              <p>{banner.text}</p>
              <a className="button button-gold" href={business.orderUrl}>
                <Utensils size={17} aria-hidden="true" />
                <span>View Our Menu</span>
              </a>
            </div>
          </div>
        </section>

        <section className="section reviews-section">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow dark">Happy customers</p>
              <h2>Customer reviews & feedback</h2>
            </div>
            <div className="reviews-layout">
              <article className="rating-card">
                <strong>4.4</strong>
                <div className="stars" aria-label="4.4 star rating">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={18} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <span>Based on 278 Google reviews</span>
              </article>
              <div className="review-grid">
                {reviews.map((review) => (
                  <article className="review-card" key={review.name}>
                    <div className="review-top">
                      <strong>{review.name}</strong>
                      <span>{review.rating}.0</span>
                    </div>
                    <div className="stars small" aria-label={`${review.rating} star rating`}>
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} size={15} fill="currentColor" aria-hidden="true" />
                      ))}
                    </div>
                    <p>{review.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

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
          <div className="hours-box">
            <Clock size={22} aria-hidden="true" />
            <h2>Fresh Daily</h2>
            <p>Call ahead for current dining, takeaway and delivery times.</p>
            <Gift size={22} aria-hidden="true" />
            <p>Event catering and family meals available by request.</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>Copyright © 2026 Shalimar Curries. All rights reserved.</span>
          <span>Built with Next.js</span>
        </div>
      </footer>
    </>
  );
}
