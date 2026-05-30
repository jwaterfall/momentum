"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, TaskPriority, task } from "@/db/schema";
import { capitalize } from "@/lib/utils";

import { createTask, updateTask } from "../actions";

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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function TaskFormDialog({
  task,
  children,
  open: openProp,
  onOpenChange,
}: TaskFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const isEdit = !!task;

  const form = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultTaskValues,
  });

  const handleOpenChange = (next: boolean) => {
    onOpenChange?.(next);
    if (openProp === undefined) {
      setInternalOpen(next);
    }
  };

  useEffect(() => {
    if (open) {
      form.reset(task ?? defaultTaskValues);
    }
  }, [open, task, form]);

  const handleSubmit = async (data: TaskFormInput) => {
    if (isEdit && task) {
      await updateTask(task.id, data);
    } else {
      await createTask(data);
    }
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children != null ? <DialogTrigger render={children as React.ReactElement} /> : null}
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
                        <SelectValue>
                          {(value) => (typeof value === "string" ? capitalize(value) : null)}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {Object.values(TaskPriority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {capitalize(priority)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
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
