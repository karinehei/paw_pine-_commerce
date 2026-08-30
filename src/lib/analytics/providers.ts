import type { AnalyticsItem, EcommerceEvent } from "@/lib/analytics/types";
import { SESSION_EVENTS_KEY } from "@/lib/analytics/types";

export interface AnalyticsProvider {
  readonly name: string;
  track(event: EcommerceEvent): void | Promise<void>;
}

/** Console logger for local development. Not a vendor SDK. */
export function createDevelopmentAnalyticsProvider(): AnalyticsProvider {
  return {
    name: "development",
    track(event) {
      console.info("[analytics]", event.name, event);
    },
  };
}

/** GA4-shaped window.dataLayer pushes for optional GTM. */
export function createDataLayerAnalyticsProvider(): AnalyticsProvider {
  return {
    name: "dataLayer",
    track(event) {
      if (typeof window === "undefined") {
        return;
      }
      window.dataLayer = window.dataLayer ?? [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push(toDataLayerPayload(event));
    },
  };
}

/** Last 200 events in sessionStorage for `/demo/analytics`. First-party only. */
export function createSessionAnalyticsProvider(): AnalyticsProvider {
  return {
    name: "session",
    track(event) {
      if (typeof window === "undefined") {
        return;
      }
      try {
        const raw = window.sessionStorage.getItem(SESSION_EVENTS_KEY);
        const existing: EcommerceEvent[] = raw
          ? (JSON.parse(raw) as EcommerceEvent[])
          : [];
        existing.push(event);
        window.sessionStorage.setItem(
          SESSION_EVENTS_KEY,
          JSON.stringify(existing.slice(-200)),
        );
      } catch {
        // Private browsing or blocked storage should not break checkout.
      }
    },
  };
}

export function toDataLayerPayload(event: EcommerceEvent): Record<string, unknown> {
  switch (event.name) {
    case "page_view":
      return {
        event: event.name,
        page_path: event.page_path,
        page_title: event.page_title,
      };
    case "search":
      return {
        event: event.name,
        search_term: event.search_term,
        results_count: event.results_count,
      };
    case "newsletter_signup":
      return { event: event.name };
    case "wishlist_add":
    case "wishlist_remove":
      return {
        event: event.name,
        ecommerce: {
          items: event.items.map(toGa4Item),
        },
      };
    default:
      return {
        event: event.name,
        ecommerce: {
          currency: "currency" in event ? event.currency : undefined,
          value: "value" in event ? event.value : undefined,
          transaction_id: event.name === "purchase" ? event.transaction_id : undefined,
          items: "items" in event ? event.items.map(toGa4Item) : undefined,
          item_list_id: "item_list_id" in event ? event.item_list_id : undefined,
          item_list_name: "item_list_name" in event ? event.item_list_name : undefined,
        },
      };
  }
}

function toGa4Item(item: AnalyticsItem): Record<string, unknown> {
  return {
    item_id: item.id,
    item_name: item.name,
    item_brand: item.brand,
    item_category: item.category,
    item_variant: item.variant,
    price: item.price,
    quantity: item.quantity,
    item_category2: item.species,
    handle: item.handle,
    currency: item.currency,
  };
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}
