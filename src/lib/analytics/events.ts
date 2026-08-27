export type AnalyticsEventName =
  | "view_item"
  | "view_item_list"
  | "add_to_cart"
  | "remove_from_cart"
  | "begin_checkout"
  | "search"
  | "newsletter_signup";

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
}

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  items?: AnalyticsItem[];
  search_term?: string;
  value?: number;
  currency?: string;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: Record<string, unknown> = {
    event: event.name,
    ecommerce: {
      currency: event.currency,
      value: event.value,
      items: event.items,
    },
    search_term: event.search_term,
  };

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push(payload);

  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event.name, payload);
  }
}
