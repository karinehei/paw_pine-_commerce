export interface AnalyticsItem {
  id: string;
  handle: string;
  name: string;
  variant?: string;
  price?: number;
  quantity?: number;
  category?: string;
  species?: string;
  currency?: string;
  brand?: string;
}

export type EcommerceEvent =
  | {
      name: "page_view";
      page_path: string;
      page_title: string;
    }
  | {
      name: "view_item_list";
      item_list_id: string;
      item_list_name: string;
      items: AnalyticsItem[];
    }
  | {
      name: "select_item";
      item_list_id?: string;
      item_list_name?: string;
      items: AnalyticsItem[];
    }
  | {
      name: "view_item";
      currency: string;
      value: number;
      items: AnalyticsItem[];
    }
  | {
      name: "search";
      search_term: string;
      results_count?: number;
    }
  | {
      name: "add_to_cart";
      currency: string;
      value: number;
      items: AnalyticsItem[];
    }
  | {
      name: "remove_from_cart";
      currency?: string;
      value?: number;
      items: AnalyticsItem[];
    }
  | {
      name: "view_cart";
      currency: string;
      value: number;
      items: AnalyticsItem[];
    }
  | {
      name: "begin_checkout";
      currency: string;
      value: number;
      items: AnalyticsItem[];
    }
  | {
      name: "purchase";
      transaction_id: string;
      currency: string;
      value: number;
      items: AnalyticsItem[];
      demo?: true;
    }
  | {
      name: "newsletter_signup";
    };

/** @deprecated Use EcommerceEvent. Kept so existing imports keep compiling. */
export type AnalyticsEvent = EcommerceEvent;

export const SESSION_EVENTS_KEY = "paw_pine_analytics_events";
export const CONSENT_COOKIE = "paw_pine_consent";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;
export const CONSENT_EVENT = "paw-pine-consent";
