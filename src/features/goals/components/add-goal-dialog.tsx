import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { GoalFormDialog } from "./goal-form-dialog";

export function AddGoalDialog() {
  return (
    <GoalFormDialog>
      <Button variant="ghost" size="icon">
        <Plus />
      </Button>
    </GoalFormDialog>
  );
}
