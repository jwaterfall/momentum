"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { createTask, updateTask } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalize } from "@/lib/utils";

import { Task, TaskPriority, task } from "../db/schema";

const taskFormSchema = createInsertSchema(task, {
  title: (schema) => schema.min(1, "Title is required"),
  priority: z.enum(TaskPriority).nullish(),
}).omit({ userId: true });

export type TaskFormInput = z.infer<typeof taskFormSchema>;

const defaultTaskValues: TaskFormInput = {
  title: "",
  priority: TaskPriority.Normal,
};

type TaskFormDialogProps = {
  task?: Task | null;
  children?: React.ReactNode;
};

export function TaskFormDialog({ task, children }: TaskFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!task;

  const form = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultTaskValues,
  });

  const handleSubmit = async (data: TaskFormInput) => {
    if (isEdit && task) {
      await updateTask(task.id, data);
    } else {
      await createTask(data);
    }
    setOpen(false);
    form.reset();
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      form.reset(task ?? defaultTaskValues);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children != null ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the task details." : "Add a task to your queue."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Clean the kitchen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    name={field.name}
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger aria-invalid={fieldState.invalid} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TaskPriority).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {capitalize(priority)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">{isEdit ? "Save changes" : "Add Task"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
