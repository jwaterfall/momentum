import { Card, CardContent } from "@/components/ui/card";

export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <p className="text-2xl font-heading font-semibold text-foreground">{value}</p>
        <p className="text-muted-foreground text-xs mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}
