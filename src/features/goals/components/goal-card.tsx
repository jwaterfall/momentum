"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { EntityActions } from "@/components/entity-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { GoalTargetType, Period } from "@/db/schema";
import { capitalize } from "@/lib/utils";

import { deleteGoal, logGoalProgress } from "../actions";
import type { GoalWithProgress } from "../services";
import { GoalFormDialog } from "./goal-form-dialog";

export function GoalCard({ goal }: { goal: GoalWithProgress }) {
  const router = useRouter();
  const [duration, setDuration] = useState<number>();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const percentage = Math.min((goal.progress / goal.targetValue) * 100, 100);
  const isDuration = goal.targetType === GoalTargetType.Duration;

  const getPeriodLabel = (p?: Period) => {
    switch (p) {
      case Period.Daily:
        return "today";
      case Period.Weekly:
        return "this week";
      case Period.Monthly:
        return "this month";
      case Period.Yearly:
        return "this year";
      default:
        return "this week";
    }
  };

  const logProgress = () => {
    startTransition(async () => {
      await logGoalProgress(goal.id, isDuration ? (duration ?? 0) : 1);
      setDuration(undefined);
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteGoal(goal.id);
      router.refresh();
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between gap-2 pb-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-medium">{goal.title}</CardTitle>
            <CardDescription>
              {goal.progress}/{goal.targetValue}{" "}
              {goal.targetType === GoalTargetType.Duration ? goal.targetUnit : "times"}{" "}
              {getPeriodLabel(goal.period)}
            </CardDescription>
          </div>
          <EntityActions
            label="Goal options"
            onEdit={() => setEditOpen(true)}
            onDelete={handleDelete}
            isDeleting={isPending}
            deleteTitle="Delete goal?"
            deleteDescription={
              <>
                This will permanently delete &quot;{goal.title}&quot; and all its progress. This
                action cannot be undone.
              </>
            }
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 mb-4">
            <Progress value={percentage} className="flex-1" />
            <p>{Math.round(percentage)}%</p>
          </div>
          <div className="flex w-full gap-2">
            {isDuration && (
              <Input
                type="number"
                value={duration ?? ""}
                placeholder={goal.targetUnit ? capitalize(goal.targetUnit) : undefined}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
              />
            )}
            <Button
              variant="secondary"
              className={isDuration ? "" : "w-full"}
              disabled={(isDuration && duration == null) || isPending}
              onClick={logProgress}
            >
              <Plus />
              Log
            </Button>
          </div>
        </CardContent>
      </Card>

      <GoalFormDialog goal={goal} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
