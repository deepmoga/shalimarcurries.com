import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PageHero, SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Shalimar Curries, an Indian restaurant in Wembley serving traditional curries, biryani, naan and takeaway."
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          title="About Shalimar Curries"
          text="Authentic Indian cuisine in the heart of Wembley, Perth."
          image="/images/restaurant-spread.webp"
        />
        <section className="section">
          <div className="container split-grid">
            <div className="image-panel">
              <Image
                src="/images/restaurant-spread.webp"
                width={900}
                height={623}
                alt="Indian dishes at Shalimar Curries"
                sizes="(max-width: 900px) 100vw, 48vw"
              />
            </div>
            <div className="content-panel">
              <p className="eyebrow dark">About Shalimar Curries</p>
              <h2>A Wembley favourite for Indian comfort food</h2>
              <p>
                Shalimar Curries brings the true taste of traditional Indian cuisine
                to Wembley WA. Our menu includes butter chicken, chicken tikka
                masala, lamb rogan josh, Hyderabadi biryani and freshly baked naan.
              </p>
              <p>
                Whether you are planning a relaxed dinner, ordering takeaway or
                feeding a family gathering, our team focuses on fresh ingredients,
                aromatic spices and generous hospitality.
              </p>
              <div className="check-list">
                {[
                  "Authentic Indian curries and tandoori favourites",
                  "Dine-in, takeaway and delivery options",
                  "Vegetarian and non-vegetarian dishes",
                  "Warm service for families, friends and events"
                ].map((item) => (
                  <span key={item}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="section why-section">
          <div className="container mission-grid">
            <article>
              <h2>Our Vision</h2>
              <p>
                To become the most loved Indian restaurant in Perth, known for
                authentic flavours, memorable dining experiences and consistent
                quality.
              </p>
            </article>
            <article>
              <h2>Our Mission</h2>
              <p>
                To serve Indian food in Wembley with fresh ingredients, expert
                cooking techniques and hospitality that makes every guest feel at
                home.
              </p>
            </article>
          </div>
        </section>
        <section className="banner-section compact-banner">
          <Image
            src="/images/signature-butter-chicken.webp"
            width={1400}
            height={920}
            alt=""
            className="banner-image"
            sizes="100vw"
          />
          <div className="container banner-content centered-banner">
            <div>
              <p className="eyebrow">Traditional & authentic taste</p>
              <h2>Authentic Indian cuisine in the heart of Wembley</h2>
              <Link className="button button-gold" href="/order-online">
                Discover More
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
