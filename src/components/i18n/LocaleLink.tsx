"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { withLocale } from "@/lib/i18n/path";

type LocaleLinkProps = ComponentProps<typeof Link>;

export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const locale = useLocale();
  const nextHref = typeof href === "string" ? withLocale(href, locale) : href;
  return <Link href={nextHref} {...props} />;
}
