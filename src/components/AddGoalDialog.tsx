"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { createGoal } from "@/app/actions";
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

import {
  CreateGoalInput,
  GoalTargetType,
  GoalTargetUnit,
  Period,
  createGoalSchema,
} from "../db/schema";

export function AddGoalDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      title: "",
      period: Period.Weekly,
      targetType: GoalTargetType.Count,
      targetValue: 1,
      targetUnit: GoalTargetUnit.Minutes,
    },
  });

  const targetType = useWatch({ control: form.control, name: "targetType" });
  const period = useWatch({ control: form.control, name: "period" });

  const onSubmit = async (data: CreateGoalInput) => {
    await createGoal(data);

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
          <DialogTitle>Add Goal</DialogTitle>
          <DialogDescription>Create a new goal or practice.</DialogDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                value={unitField.value}
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
              <Button type="submit">Save Goal</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
