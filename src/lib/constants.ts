export const SITE_NAME = "Paw & Pine";
export const SITE_TAGLINE = "Considered essentials for dogs and cats";
export const SITE_DESCRIPTION =
  "A curated Scandinavian store for dogs and cats. Thoughtful materials, quiet design, and objects made to last.";

export const DEFAULT_CURRENCY = "EUR";
export const FREE_SHIPPING_THRESHOLD = 75;
export const ESTIMATED_SHIPPING_AMOUNT = 5.9;

export const CART_COOKIE_NAME = "paw_pine_cart";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const NAV_LINKS = [
  { href: "/collections/dogs", label: "Dogs" },
  { href: "/collections/cats", label: "Cats" },
  { href: "/collections/new-arrivals", label: "New" },
  { href: "/collections/best-sellers", label: "Best sellers" },
] as const;

export const DOG_NAV = [
  { href: "/collections/dogs?category=toys", label: "Toys" },
  { href: "/collections/dogs?category=harnesses", label: "Harnesses" },
  { href: "/collections/dogs?category=beds", label: "Beds" },
  { href: "/collections/dogs?category=feeding", label: "Feeding" },
] as const;

export const CAT_NAV = [
  { href: "/collections/cats?category=toys", label: "Toys" },
  { href: "/collections/cats?category=scratching", label: "Scratching" },
  { href: "/collections/cats?category=beds", label: "Beds" },
  { href: "/collections/cats?category=feeding", label: "Feeding" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { href: "/collections/all", label: "All products" },
    { href: "/collections/dogs", label: "Dogs" },
    { href: "/collections/cats", label: "Cats" },
    { href: "/collections/new-arrivals", label: "New arrivals" },
  ],
  help: [
    { href: "/shipping", label: "Shipping" },
    { href: "/returns", label: "Returns" },
    { href: "/contact", label: "Contact" },
  ],
  house: [
    { href: "/about", label: "About" },
    { href: "/search", label: "Search" },
    { href: "/cart", label: "Cart" },
  ],
} as const;
