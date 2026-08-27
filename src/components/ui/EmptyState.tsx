import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { href: string; label: string };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <h2 className="font-display text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{description}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-6 inline-block border border-ink px-5 py-2.5 text-sm tracking-[0.12em] uppercase"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
