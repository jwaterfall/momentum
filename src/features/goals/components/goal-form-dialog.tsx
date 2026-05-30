"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { Goal, GoalTargetType, GoalTargetUnit, Period, goal } from "@/db/schema";
import { capitalize } from "@/lib/utils";

import { createGoal, updateGoal } from "../actions";

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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function GoalFormDialog({
  goal,
  children,
  open: openProp,
  onOpenChange,
}: GoalFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const isEdit = !!goal;

  const form = useForm<GoalFormInput>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: defaultGoalValues,
  });

  const targetType = useWatch({ control: form.control, name: "targetType" });
  const period = useWatch({ control: form.control, name: "period" });

  const handleOpenChange = (next: boolean) => {
    onOpenChange?.(next);
    if (openProp === undefined) {
      setInternalOpen(next);
    }
  };

  useEffect(() => {
    if (open) {
      form.reset(goal ?? defaultGoalValues);
    }
  }, [open, goal, form]);

  const onSubmit = async (data: GoalFormInput) => {
    if (isEdit && goal) {
      await updateGoal(goal.id, data);
    } else {
      await createGoal(data);
    }
    handleOpenChange(false);
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
                          <SelectValue>
                            {(value) => (typeof value === "string" ? capitalize(value) : null)}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(Period).map((p) => (
                            <SelectItem key={p} value={p}>
                              {capitalize(p)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
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
                          <SelectValue>
                            {(value) => (typeof value === "string" ? capitalize(value) : null)}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(GoalTargetType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {capitalize(type)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
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
                                    <SelectValue>
                                      {(value) =>
                                        typeof value === "string" ? capitalize(value) : null
                                      }
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    {Object.values(GoalTargetUnit).map((unit) => (
                                      <SelectItem key={unit} value={unit}>
                                        {capitalize(unit)}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
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
