import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { href: string; label: string };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="px-4 py-16 text-center">
      <h2 className="font-display text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{description}</p>
      {action ? (
        <Link href={action.href} className="btn-secondary mt-8">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
