import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { requirePageAuth } from "@/utils/require-page-auth";

export default async function StatsPage() {
  await requirePageAuth();

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Stats" description="View your progress and statistics" />
      <EmptyState>Stats page coming soon...</EmptyState>
    </div>
  );
}
