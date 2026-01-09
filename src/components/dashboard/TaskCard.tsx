"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, ChevronDown, ChevronUp, Equal } from "lucide-react";

import { completeTask } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, TaskPriority } from "@/db/schema";

export function TaskCard({ task }: { task: Task }) {
  const getPriorityIcon = () => {
    switch (task.priority) {
      case TaskPriority.High:
        return <ChevronUp className="h-4 w-4 text-destructive" />;
      case TaskPriority.Low:
        return <ChevronDown className="h-4 w-4 text-secondary" />;
      default:
        return <Equal className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="flex-row justify-between items-center">
      <CardHeader className="pr-0 flex-1">
        <CardTitle className="flex items-center gap-2">
          {getPriorityIcon()}
          {task.title}
        </CardTitle>
        <CardDescription>
          Created{" "}
          {task.createdAt
            ? formatDistanceToNow(new Date(task.createdAt), {
                addSuffix: true,
              })
            : "just now"}
        </CardDescription>
      </CardHeader>
      <Button size="icon" variant="outline" onClick={() => completeTask(task.id)} className="mr-4">
        <Check className="h-5 w-5" />
      </Button>
    </Card>
  );
}
