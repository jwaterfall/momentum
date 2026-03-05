"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { createTask } from "@/app/actions";
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

import { CreateTaskInput, TaskPriority, createTaskSchema } from "../db/schema";

export function AddTaskDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      priority: TaskPriority.Normal,
    },
  });

  const handleSubmit = async (data: CreateTaskInput) => {
    await createTask(data);

    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>Add a task to your queue.</DialogDescription>
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
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
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
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
