export function withLanguageInContext(document: string): string {
  if (document.includes("@inContext")) {
    return document;
  }

  const withArgs = document.replace(
    /\b(query|mutation)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g,
    (_all, kind: string, name: string, args: string) => {
      const trimmed = args.trim().replace(/,\s*$/, "");
      const nextArgs = trimmed
        ? `${trimmed}, $language: LanguageCode`
        : `$language: LanguageCode`;
      return `${kind} ${name}(${nextArgs}) @inContext(language: $language)`;
    },
  );

  return withArgs.replace(
    /\b(query|mutation)\s+([A-Za-z0-9_]+)\s*\{/g,
    (_all, kind: string, name: string) =>
      `${kind} ${name}($language: LanguageCode) @inContext(language: $language) {`,
  );
}
