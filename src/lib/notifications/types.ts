export interface BackInStockInput {
  email: string;
  handle: string;
  variantId?: string;
}

export interface BackInStockResult {
  ok: true;
  demo: true;
}

export interface NotificationProvider {
  subscribeBackInStock(input: BackInStockInput): Promise<BackInStockResult>;
}
