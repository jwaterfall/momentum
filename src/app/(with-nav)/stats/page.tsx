import { requirePageAuth } from "@/utils/require-page-auth";

export default async function StatsPage() {
  await requirePageAuth();

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Stats</h1>
        <p className="text-muted-foreground text-sm">View your progress and statistics</p>
      </header>
      <div className="p-6 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
        Stats page coming soon...
      </div>
    </div>
  );
}
