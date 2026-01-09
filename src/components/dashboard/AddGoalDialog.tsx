"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoalTargetType, GoalTargetUnit, Period } from "@/db/schema";
import { capitalize } from "@/lib/utils";

export function AddGoalDialog() {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<Period>(Period.Weekly);
  const [targetType, setTargetType] = useState<GoalTargetType>(GoalTargetType.Count);
  const [targetUnit, setTargetUnit] = useState<GoalTargetUnit>(GoalTargetUnit.Minutes);
  const handleSubmit = async (formData: FormData) => {
    await createGoal(formData);

    setOpen(false);
    setPeriod(Period.Weekly);
    setTargetType(GoalTargetType.Count);
    setTargetUnit(GoalTargetUnit.Minutes);
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
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input name="title" placeholder="e.g. Piano, Run, Read" required />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Period</Label>
                <Select name="period" value={period} onValueChange={(v) => setPeriod(v as Period)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Period).map((p) => (
                      <SelectItem key={p} value={p}>
                        {capitalize(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1">
                <Label>Track By</Label>
                <Select
                  name="targetType"
                  value={targetType}
                  onValueChange={(v) => setTargetType(v as GoalTargetType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(GoalTargetType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {capitalize(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1">
                <Label className="capitalize">{period} Target</Label>
                <div className="flex gap-2">
                  <Input
                    name="targetValue"
                    type="number"
                    defaultValue="1"
                    min="1"
                    required
                    className="flex-1"
                  />
                  {targetType === GoalTargetType.Duration && (
                    <Select
                      name="targetUnit"
                      value={targetUnit}
                      onValueChange={(v) => setTargetUnit(v as GoalTargetUnit)}
                    >
                      <SelectTrigger className="w-30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(GoalTargetUnit).map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {capitalize(unit)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
