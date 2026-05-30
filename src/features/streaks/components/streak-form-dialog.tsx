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
import { Streak, streak } from "@/db/schema";

import { createStreak, updateStreak } from "../actions";

const streakFormSchema = createInsertSchema(streak, {
  title: (schema) => schema.min(1, "Title is required"),
}).omit({ userId: true });

export type StreakFormInput = z.infer<typeof streakFormSchema>;

const defaultStreakValues: StreakFormInput = {
  title: "",
};

type StreakFormDialogProps = {
  streak?: Streak | null;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function StreakFormDialog({
  streak,
  children,
  open: openProp,
  onOpenChange,
}: StreakFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const isEdit = !!streak;

  const form = useForm<StreakFormInput>({
    resolver: zodResolver(streakFormSchema),
    defaultValues: defaultStreakValues,
  });

  const handleOpenChange = (next: boolean) => {
    onOpenChange?.(next);
    if (openProp === undefined) {
      setInternalOpen(next);
    }
  };

  useEffect(() => {
    if (open) {
      form.reset(streak ?? defaultStreakValues);
    }
  }, [open, streak, form]);

  const handleSubmit = async (data: StreakFormInput) => {
    if (isEdit && streak) {
      await updateStreak(streak.id, data);
    } else {
      await createStreak(data);
    }
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children != null ? <DialogTrigger render={children as React.ReactElement} /> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Streak" : "Add Streak"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the streak details." : "Track something you want to avoid."}
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
                    <Input placeholder="e.g. Don't drink, No late-night snacks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">{isEdit ? "Save changes" : "Add Streak"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
