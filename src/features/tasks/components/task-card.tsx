"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Check, ChevronDown, ChevronUp, Equal } from "lucide-react";

import { EntityActions } from "@/components/entity-actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, TaskPriority } from "@/db/schema";

import { completeTask, deleteTask } from "../actions";
import { TaskFormDialog } from "./task-form-dialog";

export function TaskCard({ task }: { task: Task }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  const handleComplete = () => {
    startTransition(async () => {
      await completeTask(task.id);
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTask(task.id);
      router.refresh();
    });
  };

  return (
    <>
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
        <div className="flex items-center gap-1 mr-4">
          <EntityActions
            label="Task options"
            onEdit={() => setEditOpen(true)}
            onDelete={handleDelete}
            isDeleting={isPending}
            deleteTitle="Delete task?"
            deleteDescription={
              <>
                This will permanently delete &quot;{task.title}&quot;. This action cannot be undone.
              </>
            }
          />
          <Button
            size="icon"
            variant="outline"
            onClick={handleComplete}
            disabled={isPending}
            className="size-9"
          >
            <Check className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      <TaskFormDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
