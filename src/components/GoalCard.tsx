"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, Pencil, Plus, Trash2 } from "lucide-react";

import { deleteGoal, logGoalProgress } from "@/app/actions";
import { GoalFormDialog } from "@/components/GoalFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { capitalize } from "@/lib/utils";

import { Goal, GoalTargetType, Period } from "../db/schema";

type GoalWithProgress = Goal & {
  progress: number;
};

export function GoalCard({ goal }: { goal: GoalWithProgress }) {
  const router = useRouter();
  const [duration, setDuration] = useState<number>();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
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
      setDeleteOpen(false);
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
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="size-8 shrink-0" />}
            >
              <Ellipsis className="h-4 w-4" />
              <span className="sr-only">Goal options</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{goal.title}&quot; and all its progress. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isPending} onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
