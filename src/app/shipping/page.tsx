export const metadata = {
  title: "Shipping",
  description: "Shipping times, complimentary threshold, and delivery notes for Paw & Pine.",
};

export default function ShippingPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">Shipping</h1>
      <div className="mt-8 space-y-5 text-muted">
        <p>
          Orders are packed in Oslo and usually leave within 2–4 working days. You will receive a
          tracking note when the parcel is with the courier.
        </p>
        <p>
          Complimentary shipping applies to orders over €75 within the EU. Below that threshold we
          estimate €5.90 for standard delivery. Islands and remote postcodes may take longer.
        </p>
        <p>
          Furniture-scale pieces such as the raised bed ship in a second carton. If a line is marked
          made to order, the product page will say so.
        </p>
      </div>
    </article>
  );
}
