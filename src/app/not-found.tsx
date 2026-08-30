import { EmptyState } from "@/components/ui/EmptyState";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";

export const metadata = {
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const t = getMessages(await getLocale());
  return (
    <EmptyState
      heading="h1"
      title={t.notFoundTitle}
      description={t.notFoundDescription}
      action={{ href: "/collections/all", label: t.browseTheShop }}
    />
  );
}
