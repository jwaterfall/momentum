import {
  ChangeEmailCard,
  ChangePasswordCard,
  DeleteAccountCard,
  SessionsCard,
  UpdateNameCard,
  UpdateUsernameCard,
} from "@daveyplate/better-auth-ui";

import { PrivateRoute } from "@/components/PrivateRoute";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  return (
    <PrivateRoute>
      <div className="p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Account Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
        </header>

        <div className="space-y-4">
          <ChangeEmailCard classNames={{ button: "w-full" }} />
          <ChangePasswordCard classNames={{ button: "w-full" }} />
          <UpdateNameCard classNames={{ button: "w-full" }} />
          <UpdateUsernameCard classNames={{ button: "w-full" }} />
          <SessionsCard />
          <DeleteAccountCard classNames={{ button: "w-full" }} />
        </div>

        <Separator />

        <p className="text-xs text-muted-foreground text-center">
          Momentum v{process.env.NEXT_PUBLIC_APP_VERSION}
        </p>
      </div>
    </PrivateRoute>
  );
}
