export const metadata = {
  title: "Returns",
  description: "Return window and condition notes for Paw & Pine.",
};

export default function ReturnsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">Returns</h1>
      <div className="mt-8 space-y-5 text-muted">
        <p>
          You have 30 days from delivery to return unused items in their original condition. Start
          the return from your order email, or write to us with the order number.
        </p>
        <p>
          Wool beds and feeding vessels cannot be returned once used. Harnesses should be unworn,
          with tags attached. If a piece arrives damaged, send a photograph and we will replace it.
        </p>
        <p>
          Refunds go back to the original payment method once the parcel is inspected. We do not
          offer store credit as a substitute unless you ask for it.
        </p>
      </div>
    </article>
  );
}
