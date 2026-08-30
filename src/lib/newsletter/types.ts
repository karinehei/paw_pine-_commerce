export interface NewsletterSubscribeInput {
  email: string;
}

export interface NewsletterSubscribeResult {
  ok: true;
  demo: true;
}

export interface NewsletterProvider {
  subscribe(input: NewsletterSubscribeInput): Promise<NewsletterSubscribeResult>;
}
