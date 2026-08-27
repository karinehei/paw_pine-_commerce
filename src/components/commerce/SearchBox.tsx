"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
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
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fetched, setFetched] = useState<SearchSuggestions>(EMPTY_SUGGESTIONS);

  const query = value.trim();
  const canSuggest = showSuggestions && query.length >= 2;

  useEffect(() => {
    if (!canSuggest) {
      return;
    }

    const handle = window.setTimeout(() => {
      void fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`)
        .then((response) => response.json() as Promise<SearchSuggestions>)
        .then((payload) => {
          setFetched(payload);
          setPanelOpen(payload.products.length > 0 || payload.collections.length > 0);
          setActiveIndex(-1);
        })
        .catch(() => {
          setFetched(EMPTY_SUGGESTIONS);
        });
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, canSuggest]);

  useEffect(() => {
    if (!updateUrlOnIdle) {
      return;
    }
    const next = value.trim();
    const handle = window.setTimeout(() => {
      router.replace(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
    }, 400);
    return () => window.clearTimeout(handle);
  }, [value, updateUrlOnIdle, router]);

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
  const options = [
    ...suggestions.collections.map((item) => ({
      href: `/collections/${item.handle}`,
      label: item.title,
      kind: "Category" as const,
    })),
    ...suggestions.products.map((item) => ({
      href: `/products/${item.handle}`,
      label: item.title,
      kind: item.vendor,
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
    go(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
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
          Search products
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
          placeholder="Search"
          className="w-full border-0 border-b border-border bg-transparent py-2 text-sm outline-none placeholder:text-muted focus-visible:border-ink"
        />
      </form>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-40 mt-1 w-full min-w-56 border border-border bg-paper py-2 shadow-sm"
        >
          {options.map((option, index) => (
            <li key={option.href} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={`flex w-full flex-col px-3 py-2 text-left text-sm ${
                  index === activeIndex ? "bg-linen" : ""
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => go(option.href)}
              >
                <span>{option.label}</span>
                <span className="text-xs text-muted">{option.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
