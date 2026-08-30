# Future architecture

Paw & Pine does not call Posti, Matkahuolto, or an email vendor. Adapters below that are not `Mock*` are **not live**.

## Real

- Shopify catalogue (when Storefront credentials are present)
- Shopify cart
- Shopify-hosted checkout and payment

Demo mode substitutes a local catalogue and a cookie cart so the repo is reviewable without a shop. Payment is never taken in this repository.

## Simulated

- **Delivery rates** — `MockShippingProvider`. Cart **Delivery estimate** asks for a Finnish postal code (`^[0-9]{5}$`) and shows demo methods: parcel locker €5.90, service point €6.50, home delivery €12.90. Copy: _Demo delivery rates. Final delivery options are confirmed during Shopify Checkout._ The estimator does not change Shopify shipping, create labels, or contact a carrier.
- **Back-in-stock delivery** — `MockNotificationProvider`. “Notify me when available” validates email and product, then acknowledges. No email is sent.
- **Newsletter delivery** — `MockNewsletterProvider`. Footer signup validates email. No Mailchimp, Klaviyo, Brevo, or Resend dependency.
- **Contact form** — `/api/contact` validates name, email, and message, then returns `{ ok: true, demo: true }`. No mailbox or helpdesk is called.

```ts
interface ShippingProvider {
  getRates(...)
  createShipment(...)
  getTracking(...)
}
```

## Future production adapters

| Adapter                       | Role                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `PostiShippingProvider`       | Not implemented. Server-only `POSTI_*` credentials. Never in the browser.                      |
| `MatkahuoltoShippingProvider` | Not implemented. Same pattern with `MATKAHUOLTO_*`.                                            |
| Email marketing provider      | Swap `MockNewsletterProvider` / `MockNotificationProvider` for Shopify Customer API or an ESP. |

A live shipping adapter would sit on a Shopify carrier service or checkout UI extension for `getRates`, and a fulfilment webhook for `createShipment`. Final rates remain Shopify’s responsibility.

## AI-assisted product discovery

Optional. Conventional search and collection filters remain the default path. Nothing in this repository currently calls an LLM.
