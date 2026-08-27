import { isGtmId } from "@/lib/security";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) {
    return "http://localhost:3000";
  }
  return url.replace(/\/$/, "");
}

export function getGtmId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  if (!id || !isGtmId(id)) {
    return undefined;
  }
  return id;
}
