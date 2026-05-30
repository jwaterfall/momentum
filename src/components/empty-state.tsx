export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
      {children}
    </div>
  );
}
