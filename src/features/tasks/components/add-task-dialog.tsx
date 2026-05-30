import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TaskFormDialog } from "./task-form-dialog";

export function AddTaskDialog() {
  return (
    <TaskFormDialog>
      <Button variant="ghost" size="icon">
        <Plus />
      </Button>
    </TaskFormDialog>
  );
}
