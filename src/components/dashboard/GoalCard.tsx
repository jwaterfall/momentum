"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { logGoalProgress } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Goal, GoalTargetType, Period } from "../../db/schema";
import { capitalize } from "@/lib/utils";

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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{goal.title}</CardTitle>
        <CardDescription>
          {goal.progress}/{goal.targetValue}{" "}
          {goal.targetType === GoalTargetType.Duration ? goal.targetUnit : "times"}{" "}
          {getPeriodLabel(goal.period)}
        </CardDescription>
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
                value={duration || ""}
                placeholder={goal.targetUnit ? capitalize(goal.targetUnit) : undefined}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
              />
            )}
            <Button
              variant="secondary"
              className={isDuration ? "" : "w-full"}
              disabled={isDuration ? !duration : false}
              onClick={() => {
                logGoalProgress(goal.id, isDuration ? duration : 1);
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
