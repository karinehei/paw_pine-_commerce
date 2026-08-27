"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface SearchInputProps {
  defaultValue?: string;
  id?: string;
  className?: string;
}

export function SearchInput({
  defaultValue = "",
  id = "search",
  className = "",
}: SearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  return (
    <form onSubmit={onSubmit} role="search" className={className}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search"
        className="w-full border-0 border-b border-border bg-transparent py-2 text-sm outline-none placeholder:text-muted focus-visible:border-ink"
      />
    </form>
  );
}
