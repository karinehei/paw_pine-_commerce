# Future architecture

Documented adapters that are **not live**. Paw & Pine does not call Posti, Matkahuolto, or an email vendor.

## What is real today

Shopify owns catalogue, cart, and hosted checkout when credentials are present. Demo mode uses the local catalogue and a cookie cart. Payment is never taken in this repository.

## Shipping

Checkout and payment stay on Shopify. The cart **Delivery estimate** is a UX sketch: it asks for a Finnish postal code (`^[0-9]{5}$`) and shows **demo** rates from `MockShippingProvider`. It does not change Shopify shipping, create labels, or contact a carrier.

```ts
interface ShippingProvider {
  getRates(...)
  createShipment(...)
  getTracking(...)
}
```

| Adapter                       | Status                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `MockShippingProvider`        | Implemented. Parcel locker €5.90, service point €6.50, home €12.90. Marked demo.    |
| `PostiShippingProvider`       | Not implemented. Would use server-only `POSTI_*` credentials, never in the browser. |
| `MatkahuoltoShippingProvider` | Not implemented. Same pattern with `MATKAHUOLTO_*`.                                 |

**Where a live adapter would sit:** Shopify carrier service or checkout UI extension for `getRates`; a fulfilment webhook for `createShipment`. Final rates remain Shopify’s responsibility.

## Notifications and newsletter

| Adapter                    | Status                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| `MockNotificationProvider` | Implemented. “Notify me when available” validates email and product, then acknowledges. No email is sent. |
| `MockNewsletterProvider`   | Implemented. Footer signup validates email. No Mailchimp, Klaviyo, Brevo, or Resend dependency.           |

A production shop would swap the mock for a provider that talks to Shopify Customer API or an ESP, using server env vars only.

## AI-assisted product discovery

Optional. Conventional search and collection filters remain the default path. Nothing in this repository currently calls an LLM.
