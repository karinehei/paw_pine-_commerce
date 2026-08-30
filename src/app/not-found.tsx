import { EmptyState } from "@/components/ui/EmptyState";
import { getLocale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";

export default async function NotFound() {
  const t = getMessages(await getLocale());
  return (
    <EmptyState
      title={t.notFoundTitle}
      description={t.notFoundDescription}
      action={{ href: "/collections/all", label: t.browseTheShop }}
    />
  );
}
