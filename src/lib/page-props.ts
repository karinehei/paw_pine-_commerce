import type { ReactNode } from "react";

export type SearchParams = Record<string, string | string[] | undefined>;

export interface HandlePageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<SearchParams>;
}

export interface QueryPageProps {
  params: Promise<Record<string, never>>;
  searchParams: Promise<SearchParams>;
}

export interface RootLayoutProps {
  children: ReactNode;
}

export function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
