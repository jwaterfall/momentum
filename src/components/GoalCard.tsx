"use client";

import { useState } from "react";
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
  AlertDialogTrigger,
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
  const [duration, setDuration] = useState<number>();

  const percentage = Math.min((goal.progress / goal.targetValue) * 100, 100);

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

  const isDuration = goal.targetType === GoalTargetType.Duration;

  return (
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
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 shrink-0">
              <Ellipsis className="h-4 w-4" />
              <span className="sr-only">Goal options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <GoalFormDialog goal={goal}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </GoalFormDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
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
                  <AlertDialogAction variant="destructive" onClick={() => deleteGoal(goal.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2 mb-4">
          <Progress value={percentage} />
          <p>{Math.round(percentage)}%</p>
        </div>
        <div className="flex gap-2">
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
              disabled={isDuration ? duration == null : false}
              onClick={() => {
                logGoalProgress(goal.id, isDuration ? (duration ?? 0) : 1);
                setDuration(undefined);
              }}
            >
              <Plus />
              Log
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
