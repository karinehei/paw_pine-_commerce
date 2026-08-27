import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      title="This page is not in the house"
      description="The link may be out of date, or the piece has left the edit."
      action={{ href: "/collections/all", label: "Browse the shop" }}
    />
  );
}
