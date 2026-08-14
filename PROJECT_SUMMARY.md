# Shalimar Curries Project Summary

## Overview
This is a Next.js (App Router) web application for "Shalimar Curries", a restaurant offering dine-in, takeaway, and delivery services.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Standard CSS (e.g., `globals.css`)
- **Database**: MySQL (via `mysql2/promise`)
- **Icons**: Lucide React
- **Mail**: Nodemailer

## Project Structure
- `/app`: Contains routes for the main site (e.g., `page.tsx`, `menu`, `order-online`, `checkout`, `about-us`, `contact-us`) and the `/admin` portal.
- `/components`: Reusable UI components (e.g., `site-chrome.tsx`).
- `/content`: Static content for pages.
- `/database`: Contains the `schema.sql` defining `menu_categories`, `menu_products`, `app_settings`, `delivery_settings`, and `orders`.
- `/lib`: Helper modules for DB connection (`db.ts`), menu handling (`menu-store.ts`), mailing (`mail.ts`), reCAPTCHA configuration (`recaptcha.ts`), and site settings (`site-settings.ts`).
- `/scripts`: Utility scripts like `import-woocommerce-products.mjs`.
- `/data`: Contains default JSON configurations like `site-settings.json`.

## Key Features
- **Booking / Reservation System**: Users can book tables via a form on the homepage, secured with Google reCAPTCHA.
- **Online Ordering System**: Supports both Delivery and Pickup modes, along with a cart/checkout process.
- **Dynamic Site Settings**: Fetches site configuration (branding, contact details, mail settings) from the database with a JSON fallback.
- **Admin Dashboard**: For managing menu items, orders, and application settings.

## Note for Future Chats
This workspace (`e:\Next.js\shalimarcurries.com`) is the root directory for all development and modifications. Future instructions and requests will be executed within this context.
