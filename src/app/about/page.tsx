import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale());
  return { title: t.about, description: t.aboutMeta };
}

export default async function AboutPage() {
  const t = getMessages(await getLocale());
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <p className="text-muted text-xs tracking-[0.16em] uppercase">{t.theHouse}</p>
      <h1 className="font-display mt-3 text-5xl">{t.aboutTitle}</h1>
      <div className="text-muted mt-8 space-y-5">
        <p>{t.aboutP1}</p>
        <p>{t.aboutP2}</p>
        <p>{t.aboutP3}</p>
      </div>
    </article>
  );
}
