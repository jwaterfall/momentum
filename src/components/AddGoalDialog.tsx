"use client";

import { Plus } from "lucide-react";

import { GoalFormDialog } from "@/components/GoalFormDialog";
import { Button } from "@/components/ui/button";

export function AddGoalDialog() {
  return (
    <GoalFormDialog>
      <Button variant="ghost" size="icon">
        <Plus />
      </Button>
    </GoalFormDialog>
  );
}
