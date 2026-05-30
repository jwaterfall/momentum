"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { createGoal, updateGoal } from "@/app/actions";
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

import { Goal, GoalTargetType, GoalTargetUnit, Period, goal } from "../db/schema";

const goalFormSchema = createInsertSchema(goal, {
  title: (schema) => schema.min(1, "Title is required"),
  targetValue: z.coerce.number<number>().min(1, "Target must be at least 1"),
  period: z.enum(Period),
  targetType: z.enum(GoalTargetType).nullish(),
  targetUnit: z.enum(GoalTargetUnit).nullish(),
}).omit({ userId: true });

export type GoalFormInput = z.infer<typeof goalFormSchema>;

const defaultGoalValues: GoalFormInput = {
  title: "",
  period: Period.Weekly,
  targetType: GoalTargetType.Count,
  targetValue: 1,
  targetUnit: GoalTargetUnit.Minutes,
};

type GoalFormDialogProps = {
  goal?: Goal | null;
  children?: React.ReactNode;
};

export function GoalFormDialog({ goal, children }: GoalFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!goal;

  const form = useForm<GoalFormInput>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: defaultGoalValues,
  });

  const targetType = useWatch({ control: form.control, name: "targetType" });
  const period = useWatch({ control: form.control, name: "period" });

  const onSubmit = async (data: GoalFormInput) => {
    if (isEdit && goal) {
      await updateGoal(goal.id, data);
    } else {
      await createGoal(data);
    }
    setOpen(false);
    form.reset();
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      form.reset(goal ?? defaultGoalValues);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children != null ? <DialogTrigger render={children as React.ReactElement} /> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Goal" : "Add Goal"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the goal details." : "Create a new goal."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Piano, Run, Read" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Period).map((p) => (
                          <SelectItem key={p} value={p}>
                            {capitalize(p)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Track By</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(GoalTargetType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {capitalize(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{period} Target</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      {targetType === GoalTargetType.Duration && (
                        <FormField
                          control={form.control}
                          name="targetUnit"
                          render={({ field: unitField }) => (
                            <FormItem className="space-y-0 w-32">
                              <Select
                                name={unitField.name}
                                value={unitField.value ?? undefined}
                                onValueChange={unitField.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.values(GoalTargetUnit).map((unit) => (
                                    <SelectItem key={unit} value={unit}>
                                      {capitalize(unit)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">{isEdit ? "Save changes" : "Save Goal"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
