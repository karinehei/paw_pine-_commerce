import { ContactForm } from "@/components/commerce/ContactForm";

export const metadata = {
  title: "Contact",
  description: "Write to Paw & Pine about orders, materials, and fit.",
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">Contact</h1>
      <p className="mt-4 text-muted">
        Questions about fit, materials, or an order. We read everything; we do not maintain a chat
        widget.
      </p>
      <ContactForm />
    </article>
  );
}
