"use client";

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
  AlertDialogTrigger,
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
      <div className="flex items-center gap-1 mr-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <Ellipsis className="h-4 w-4" />
              <span className="sr-only">Task options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <TaskFormDialog task={task}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </TaskFormDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete task?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{task.title}&quot;. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => deleteTask(task.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="icon"
          variant="outline"
          onClick={() => completeTask(task.id)}
          className="size-9"
        >
          <Check className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
