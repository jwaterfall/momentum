import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { StreakFormDialog } from "./streak-form-dialog";

export function AddStreakDialog() {
  return (
    <StreakFormDialog>
      <Button variant="ghost" size="icon">
        <Plus />
      </Button>
    </StreakFormDialog>
  );
}
