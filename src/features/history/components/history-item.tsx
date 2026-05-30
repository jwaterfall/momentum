"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteGoalLog, deleteStreakSlip, uncompleteTask } from "../actions";
import type { HistoryEntry } from "../services";

export function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isTask = entry.kind === "task";

  const handleAction = () => {
    startTransition(async () => {
      if (entry.kind === "goal") {
        await deleteGoalLog(entry.id);
      } else if (entry.kind === "streak") {
        await deleteStreakSlip(entry.id);
      } else {
        await uncompleteTask(entry.id);
      }
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{entry.title}</p>
        <p className="text-muted-foreground text-xs">
          {entry.label}
          {entry.date ? ` · ${formatDistanceToNow(new Date(entry.date), { addSuffix: true })}` : ""}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={handleAction}
        className="shrink-0"
      >
        {isTask ? <RotateCcw /> : <Trash2 />}
        {isTask ? "Undo" : "Remove"}
      </Button>
    </div>
  );
}
