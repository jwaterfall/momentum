"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Check, ChevronDown, ChevronUp, Ellipsis, Equal, Pencil, Trash2 } from "lucide-react";

import { completeTask, deleteTask } from "@/app/actions";
import { TaskFormDialog } from "@/components/TaskFormDialog";
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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Task, TaskPriority } from "../db/schema";

export function TaskCard({ task }: { task: Task }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
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
      setDeleteOpen(false);
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
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
              <Ellipsis className="h-4 w-4" />
              <span className="sr-only">Task options</span>
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{task.title}&quot;. This action cannot be undone.
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
