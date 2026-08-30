export interface BackInStockInput {
  email: string;
  handle: string;
  variantId?: string;
}

export interface BackInStockResult {
  ok: boolean;
  /** True on the mock adapter. A production notification adapter omits this or sets false. */
  demo?: boolean;
}

export interface NotificationProvider {
  subscribeBackInStock(input: BackInStockInput): Promise<BackInStockResult>;
}
