// SimpleShop API v2 response types (actual shape from /product/ endpoint)

export interface SimpleShopVariant {
  name: string;
  description: string;
  price: string;       // e.g. "12973.00" (CZK, ex-VAT)
  quantity: number | string | null; // remaining count; API returns string "0" for sold-out, number for available, null for unlimited
  store: number;
  unit: string;
}

export interface SimpleShopProduct {
  id: number;
  type: number;
  name: string;
  title: string;
  price: string;
  store: number;
  mj: string;
  amount_type: string;
  coupon_type: string;
  url_product: string;
  url_thank_you: string;
  variants: SimpleShopVariant[];
  code: string;          // form code, e.g. "qGAKO"
  archived: boolean;
  test_mode: boolean;
}

// Normalized ticket for tool responses

export interface Ticket {
  name: string;
  priceCZK: number;
  priceEUR: number;
  remaining: number | null;
  status: "available" | "sold_out";
}

// Conference data

export interface Speaker {
  name: string;
  title: string;
  company: string;
}

export interface ConferenceInfo {
  name: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  transit: string;
  website: string;
  lumaUrl: string;
  ticketsUrl: string;
  capacity: string;
  format: string;
  tagline: string;
  audience: string;
  speakers: Speaker[];
  topics: string[];
  whatsIncluded: string;
  edition2025Summary: string;
}

// Cloudflare Worker env bindings

export interface Env {
  SIMPLESHOP_EMAIL?: string;
  SIMPLESHOP_API_KEY?: string;
  DISCOUNT_CODE?: string;
}
