export interface NewsletterSubscribeInput {
  email: string;
}

export interface NewsletterSubscribeResult {
  ok: boolean;
  /** True on the mock adapter. A production ESP adapter omits this or sets false. */
  demo?: boolean;
}

export interface NewsletterProvider {
  subscribe(input: NewsletterSubscribeInput): Promise<NewsletterSubscribeResult>;
}
