"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";
import { LOCALE_HEADER, numberLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/path";
import { formatMoney } from "@/lib/format";
import type { SearchSuggestions } from "@/lib/commerce/suggest";

interface SearchBoxProps {
  defaultValue?: string;
  id?: string;
  className?: string;
  showSuggestions?: boolean;
  updateUrlOnIdle?: boolean;
}

const EMPTY_SUGGESTIONS: SearchSuggestions = { products: [], collections: [] };

export function SearchBox({
  defaultValue = "",
  id = "search",
  className = "",
  showSuggestions = true,
  updateUrlOnIdle = false,
}: SearchBoxProps) {
  const router = useRouter();
  const locale = useLocale();
  const moneyLocale = numberLocale(locale);
  const t = useMessages();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fetched, setFetched] = useState<SearchSuggestions>(EMPTY_SUGGESTIONS);
  const [loading, setLoading] = useState(false);

  const query = value.trim();
  const canSuggest = showSuggestions && query.length >= 2;

  useEffect(() => {
    if (!canSuggest) {
      return;
    }

    const handle = window.setTimeout(() => {
      setLoading(true);
      void fetch(`/api/search/suggest?q=${encodeURIComponent(query)}&locale=${locale}`, {
        headers: { [LOCALE_HEADER]: locale },
      })
        .then((response) => response.json() as Promise<SearchSuggestions>)
        .then((payload) => {
          setFetched(payload);
          setPanelOpen(payload.products.length > 0 || payload.collections.length > 0);
          setActiveIndex(-1);
        })
        .catch(() => {
          setFetched(EMPTY_SUGGESTIONS);
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, canSuggest, locale]);

  useEffect(() => {
    if (!updateUrlOnIdle) {
      return;
    }
    const next = value.trim();
    const handle = window.setTimeout(() => {
      router.replace(
        withLocale(next ? `/search?q=${encodeURIComponent(next)}` : "/search", locale),
      );
    }, 400);
    return () => window.clearTimeout(handle);
  }, [value, updateUrlOnIdle, router, locale]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const suggestions = canSuggest ? fetched : EMPTY_SUGGESTIONS;
  const options: Array<{
    href: string;
    label: string;
    kind: string;
    price?: string;
    image?: { url: string; altText: string } | null;
  }> = [
    ...suggestions.collections.map((item) => ({
      href: withLocale(`/collections/${item.handle}`, locale),
      label: item.title,
      kind: t.category,
    })),
    ...suggestions.products.map((item) => ({
      href: withLocale(`/products/${item.handle}`, locale),
      label: item.title,
      kind: [item.vendor, item.category].filter(Boolean).join(" · "),
      price: item.price ? formatMoney(item.price, moneyLocale) : undefined,
      image: item.image,
    })),
  ];
  const open = panelOpen && options.length > 0;

  function go(href: string) {
    setPanelOpen(false);
    router.push(href);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = value.trim();
    go(
      term
        ? withLocale(`/search?q=${encodeURIComponent(term)}`, locale)
        : withLocale("/search", locale),
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || options.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % options.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + options.length) % options.length);
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) {
        go(option.href);
      }
    }
    if (event.key === "Escape") {
      setPanelOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form onSubmit={onSubmit} role="search">
        <label htmlFor={id} className="sr-only">
          {t.searchProducts}
        </label>
        <input
          id={id}
          name="q"
          type="search"
          value={value}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          role="combobox"
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => {
            if (options.length > 0) {
              setPanelOpen(true);
            }
          }}
          onKeyDown={onKeyDown}
          aria-busy={loading}
          placeholder={t.searchPlaceholder}
          className="border-border placeholder:text-muted focus-visible:border-ink w-full border-0 border-b bg-transparent py-2 text-sm outline-none"
        />
      </form>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="border-border bg-paper absolute z-40 mt-1 w-full min-w-64 border py-2"
        >
          {options.map((option, index) => (
            <li key={option.href} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={`flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left text-sm ${
                  index === activeIndex ? "bg-linen" : ""
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => go(option.href)}
              >
                {option.image?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={option.image.url}
                    alt=""
                    width={40}
                    height={50}
                    className="bg-stone h-12 w-10 shrink-0 object-cover"
                  />
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{option.label}</span>
                  <span className="text-muted block truncate text-xs">
                    {option.kind}
                    {option.price ? ` · ${option.price}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
