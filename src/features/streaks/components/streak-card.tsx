"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { EntityActions } from "@/components/entity-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { deleteStreak, logSlip } from "../actions";
import type { StreakWithStats } from "../services";
import { StreakFormDialog } from "./streak-form-dialog";

export function StreakCard({ streak }: { streak: StreakWithStats }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dayLabel = streak.currentStreakDays === 1 ? "day" : "days";
  const slipLabel = streak.totalSlips === 1 ? "slip" : "slips";

  const handleLogSlip = () => {
    startTransition(async () => {
      await logSlip(streak.id);
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteStreak(streak.id);
      router.refresh();
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between gap-2 pb-2">
          <CardTitle className="text-lg font-medium">{streak.title}</CardTitle>
          <EntityActions
            label="Streak options"
            onEdit={() => setEditOpen(true)}
            onDelete={handleDelete}
            isDeleting={isPending}
            deleteTitle="Delete streak?"
            deleteDescription={
              <>
                This will permanently delete &quot;{streak.title}&quot; and all its logged slips.
                This action cannot be undone.
              </>
            }
          />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-heading font-semibold text-foreground">
            {streak.currentStreakDays}
            <span className="text-base font-normal text-muted-foreground"> {dayLabel}</span>
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            since {streak.lastSlipAt ? "last slip" : "you started"} · {streak.totalSlips}{" "}
            {slipLabel} logged
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" disabled={isPending} onClick={handleLogSlip}>
            Log slip
          </Button>
        </CardFooter>
      </Card>

      <StreakFormDialog streak={streak} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
