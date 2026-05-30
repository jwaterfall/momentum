import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { HistoryItem } from "@/features/history/components/history-item";
import { getHistory } from "@/features/history/services";
import { requirePageAuth } from "@/utils/require-page-auth";

export default async function HistoryPage() {
  await requirePageAuth();
  const entries = await getHistory();

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="History" description="Review and undo recent activity" />
      {entries.length === 0 ? (
        <EmptyState>Nothing logged yet.</EmptyState>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <HistoryItem key={`${entry.kind}-${entry.id}`} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
