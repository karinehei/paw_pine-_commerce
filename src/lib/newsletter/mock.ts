import type { NewsletterProvider, NewsletterSubscribeResult } from "@/lib/newsletter/types";

/**
 * Acknowledges the address and does not send mail.
 * A later Mailchimp/Klaviyo/Brevo adapter would implement NewsletterProvider
 * with server-only credentials. Do not import those SDKs here.
 */
export class MockNewsletterProvider implements NewsletterProvider {
  async subscribe(): Promise<NewsletterSubscribeResult> {
    return { ok: true, demo: true };
  }
}

export function getNewsletterProvider(): NewsletterProvider {
  return new MockNewsletterProvider();
}
