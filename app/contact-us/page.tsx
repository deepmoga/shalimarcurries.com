import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { siteContent } from "@/content/home";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Shalimar Curries in Wembley WA for Indian dine-in, takeaway, delivery and table reservations."
};

export default async function ContactPage({
  searchParams
}: {
  searchParams?: Promise<{ sent?: string; error?: string; mailError?: string }>;
}) {
  const { business } = siteContent;
  const params = await searchParams;
  const formStatus =
    params?.sent === "1"
      ? "Thank you. Your message has been sent."
      : params?.error === "1"
        ? `Sorry, we could not send your message. ${params.mailError || "Please call us or try again."}`
        : "";

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          title="Contact Us"
          text="Get in touch and let us know how we can help."
          image="/images/hero-curry.jpg"
        />
        <section className="section">
          <div className="container contact-page-grid">
            <div>
              <p className="eyebrow dark">Get in touch</p>
              <h2>Whenever you need us, we are here for you.</h2>
              <div className="contact-list-large">
                <a href={business.mapUrl}>
                  <MapPin size={28} aria-hidden="true" />
                  <span>
                    <small>Head Office</small>
                    {business.address}
                  </span>
                </a>
                <a href={`mailto:${business.email}`}>
                  <Mail size={28} aria-hidden="true" />
                  <span>
                    <small>Email Us</small>
                    {business.email}
                  </span>
                </a>
                <a href={`tel:${business.phone.replaceAll(" ", "")}`}>
                  <Phone size={28} aria-hidden="true" />
                  <span>
                    <small>Call Us</small>
                    {business.phone}
                  </span>
                </a>
              </div>
            </div>
            <form className="contact-form" action="/api/reservations" method="post">
              <h2>Send us a message</h2>
              <label>
                <span>Name</span>
                <input name="name" placeholder="Name" required />
              </label>
              <label>
                <span>Phone</span>
                <input name="phone" placeholder="Phone" required />
              </label>
              <label className="full-field">
                <span>Email</span>
                <input name="email" type="email" placeholder="Email" />
              </label>
              <label className="full-field">
                <span>Message</span>
                <textarea name="message" rows={6} placeholder="Message" required />
              </label>
              <button className="button button-green full-field" type="submit">
                Send
              </button>
              {formStatus ? <p className="form-status">{formStatus}</p> : null}
            </form>
          </div>
        </section>
        <section className="map-band" aria-label="Map">
          <iframe
            title="Shalimar Curries map"
            src="https://www.google.com/maps?q=338%20Cambridge%20St%2C%20Wembley%20WA%206014%2C%20Australia&output=embed"
            loading="lazy"
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
