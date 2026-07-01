export const siteContent = {
  business: {
    name: "Shalimar Curries",
    shortName: "Shalimar",
    phone: "+61 8 9383 7006",
    email: "shalimar338@gmail.com",
    address: "338 Cambridge St, Wembley WA 6014, Australia",
    facebook: "https://www.facebook.com/p/Shalimar-Curries-Wembley-100063904998418/",
    instagram: "https://www.instagram.com/shalimarcurrieswembley/",
    orderUrl: "/order-online",
    mapUrl: "https://maps.google.com/?q=Shalimar%20Curries%20338%20Cambridge%20St%20Wembley%20WA%206014"
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about-us" },
    { label: "Menu", href: "/order-online" },
    { label: "Contact", href: "/contact-us" }
  ],
  hero: {
    eyebrow: "Wembley's Indian kitchen",
    title: "Best Indian Restaurant in Wembley, Perth",
    text: "Authentic curries, tandoori favourites, biryanis and fresh naan prepared with aromatic spices and generous hospitality.",
    primaryCta: "Order Online",
    secondaryCta: "Book a Table",
    image: "/images/signature-butter-chicken.webp"
  },
  intro: {
    eyebrow: "Authentic Indian Cuisine in Wembley",
    title: "Traditional Indian flavour, served with warmth",
    text: "Shalimar Curries is a well-known Indian restaurant in Wembley WA serving authentic Indian cuisine in the heart of Perth. From rich curries and tandoori dishes to freshly baked naan, the menu is built around classic recipes, fresh ingredients and real spices.",
    image: "/images/restaurant-spread.webp",
    stats: [
      { value: "4.4", label: "Google rating" },
      { value: "278+", label: "Customer reviews" },
      { value: "338", label: "Cambridge St" }
    ]
  },
  dishes: [
    {
      name: "Butter Chicken",
      description: "Creamy tomato curry with tender chicken and balanced spice.",
      image: "/images/butter-chicken.webp"
    },
    {
      name: "Chicken Tikka Masala",
      description: "Tandoori chicken finished in a fragrant masala sauce.",
      image: "/images/chicken-tikka-masala.webp"
    },
    {
      name: "Garlic Naan",
      description: "Fresh baked naan brushed with garlic and herbs.",
      image: "/images/garlic-naan.webp"
    },
    {
      name: "Hyderabadi Biryani",
      description: "Aromatic rice, spices and slow-cooked Indian flavour.",
      image: "/images/hyderabadi-biryani.webp"
    },
    {
      name: "Lamb Rogan Josh",
      description: "Rich Kashmiri-style lamb curry with deep warming spice.",
      image: "/images/lamb-rogan-josh.webp"
    },
    {
      name: "Palak Paneer",
      description: "Paneer cooked in a smooth spinach sauce.",
      image: "/images/palak-paneer.webp"
    }
  ],
  features: [
    {
      title: "Authentic Indian Recipes",
      text: "Traditional recipes cooked with authentic spices to bring the real taste of India to your table."
    },
    {
      title: "Fast Takeaway & Delivery",
      text: "Quick and reliable takeaway and delivery for fresh Indian food at home."
    },
    {
      title: "Vegetarian & Non-Vegetarian Options",
      text: "A wide variety of vegetarian and non-vegetarian dishes for every taste."
    },
    {
      title: "Fresh Ingredients & Traditional Spices",
      text: "Fresh ingredients and premium spices create rich, flavourful Indian dishes."
    }
  ],
  booking: {
    title: "Reserve Your Experience at Shalimar",
    text: "Book your table and enjoy authentic flavours in a warm and elegant atmosphere.",
    eventTitle: "Home and Company Event",
    eventText: "Make every home celebration and company event special with Shalimar's authentic cuisine."
  },
  banner: {
    eyebrow: "Dine like Wembley, live like dreams",
    title: "Savour Wembley with heart and palate",
    text: "From casual dinners to special occasions, Shalimar Curries creates a memorable dining experience with traditional curries, aromatic biryanis and freshly baked naan.",
    image: "/images/restaurant-spread.webp"
  },
  reviews: [
    {
      name: "Tashi Pelzang",
      text: "We had a really great experience. The food was spot on in flavour, seasoning and freshness.",
      rating: 5
    },
    {
      name: "Chef Ankit Choudhary",
      text: "The fish tikka was exceptional, with depth, warmth and perfect spice balance.",
      rating: 5
    },
    {
      name: "Vim Pat",
      text: "Lovely food in this little place. Very tasty Punjabi chicken curry.",
      rating: 5
    }
  ]
};

export type SiteContent = typeof siteContent;
