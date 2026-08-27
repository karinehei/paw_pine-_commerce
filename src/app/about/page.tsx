export const metadata = {
  title: "About",
  description: "Paw & Pine is a small Scandinavian edit of objects for dogs and cats.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <p className="text-xs tracking-[0.16em] text-muted uppercase">The house</p>
      <h1 className="mt-3 font-display text-5xl">About Paw & Pine</h1>
      <div className="mt-8 space-y-5 text-muted">
        <p>
          Paw & Pine began as a reaction to the visual noise of the pet aisle. We wanted bowls that
          could sit on a kitchen counter, beds that did not apologise for being in the living room,
          and walk gear that did not look like sports equipment.
        </p>
        <p>
          The edit is small on purpose. Oak, wool, sisal, stoneware, and linen. Makers we can name.
          Nothing licensed, nothing fluorescent.
        </p>
        <p>
          This storefront is a headless catalogue. Product data, inventory, and checkout live in
          Shopify. The site you are reading owns presentation, search, and the quieter decisions
          about how an object is shown.
        </p>
      </div>
    </article>
  );
}
