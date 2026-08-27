import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  description?: string;
}

export function ErrorState({
  title = "This page could not be loaded",
  description = "Please try again in a moment. If you were adding to your bag, your items should still be there.",
}: ErrorStateProps) {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <h1 className="font-display text-4xl">{title}</h1>
      <p className="mt-4 text-muted">{description}</p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}
