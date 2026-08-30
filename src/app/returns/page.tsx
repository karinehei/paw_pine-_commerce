import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale());
  return { title: t.returnsTitle, description: t.returnsMeta };
}

export default async function ReturnsPage() {
  const t = getMessages(await getLocale());
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">{t.returnsTitle}</h1>
      <div className="text-muted mt-8 space-y-5">
        <p>{t.returnsP1}</p>
        <p>{t.returnsP2}</p>
        <p>{t.returnsP3}</p>
      </div>
    </article>
  );
}
