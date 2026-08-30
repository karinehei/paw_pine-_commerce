import { ContactForm } from "@/components/commerce/ContactForm";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale());
  return { title: t.contactTitle, description: t.contactMeta };
}

export default async function ContactPage() {
  const t = getMessages(await getLocale());
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">{t.contactTitle}</h1>
      <p className="text-muted mt-4">{t.contactIntro}</p>
      <ContactForm />
    </article>
  );
}
