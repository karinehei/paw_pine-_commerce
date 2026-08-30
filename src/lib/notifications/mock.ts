import type {
  BackInStockInput,
  BackInStockResult,
  NotificationProvider,
} from "@/lib/notifications/types";

/**
 * Records nothing durable and sends no email.
 * A production adapter would call Shopify Customer API, Klaviyo, or similar
 * from the server only.
 */
export class MockNotificationProvider implements NotificationProvider {
  async subscribeBackInStock(_input: BackInStockInput): Promise<BackInStockResult> {
    return { ok: true, demo: true };
  }
}

export function getNotificationProvider(): NotificationProvider {
  return new MockNotificationProvider();
}
