# Future architecture

Documented, not implemented. These are the next systems I would add if Paw & Pine became a live shop — not decorations for the portfolio.

## Shipping integration

Checkout and payment stay on Shopify. Carriers belong behind a server-side adapter so Posti, Matkahuolto, or a 3PL can be swapped without touching product pages.

```ts
interface Address {
  country: string;
  postalCode: string;
  city?: string;
}

interface Parcel {
  grams: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

interface ShippingRate {
  id: string;
  title: string;
  amount: string;
  currency: string;
  minDays?: number;
  maxDays?: number;
}

interface Shipment {
  id: string;
  trackingCode?: string;
  labelUrl?: string;
}

interface ShippingProvider {
  readonly name: "posti" | "matkahuolto" | string;
  getRates(input: { destination: Address; parcels: Parcel[] }): Promise<ShippingRate[]>;
  createShipment(input: {
    rateId: string;
    destination: Address;
    parcels: Parcel[];
    orderId: string;
  }): Promise<Shipment>;
  getTracking(shipmentId: string): Promise<{ status: string; events: string[] }>;
}
```

**Where it would sit:** a Shopify carrier service or checkout UI extension for rates; a fulfilment webhook for `createShipment`. Credentials stay in server env vars (`POSTI_*`, `MATKAHUOLTO_*`). The browser never sees them.

**What this repo does today:** dispatch window copy and a complimentary-shipping threshold. No carrier APIs are called.

## AI-assisted product discovery

Optional. Conventional search and collection filters remain the default path.

Example query:

> "I need a durable toy for an active 8 kg terrier that destroys normal toys."

Possible architecture:

```text
user query
  → intent extraction (species, category, size, durability)
  → catalogue filtering / retrieval (existing ProductQuery + embeddings later)
  → ranked product recommendations
  → short explanation grounded only in product title, material, features, and care text
```

Rules:

- Ground answers in catalogue fields. Do not invent stock, reviews, or medical claims.
- Fall back to `/search?q=` when the model is unavailable.
- Keep URL-shareable filters. An LLM is an extra entry point, not a replacement for crawlable collections.
- Do not add an LLM for novelty. Add it when search logs show natural-language queries that filters cannot express.

Nothing in this repository currently calls an LLM.
