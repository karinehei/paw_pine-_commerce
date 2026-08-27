export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
}

export type AnalyticsEvent =
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

export const SESSION_EVENTS_KEY = "paw_pine_analytics_events";
