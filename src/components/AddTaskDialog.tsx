"use client";

import { Plus } from "lucide-react";

import { TaskFormDialog } from "@/components/TaskFormDialog";
import { Button } from "@/components/ui/button";

export function AddTaskDialog() {
  return (
    <TaskFormDialog>
      <Button variant="ghost" size="icon">
        <Plus />
      </Button>
    </TaskFormDialog>
  );
}
