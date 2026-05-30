import { headers } from "next/headers";

import { DeleteAccountCard } from "@/components/account/DeleteAccountCard";
import { PasswordCard } from "@/components/account/PasswordCard";
import { ProfileCard } from "@/components/account/ProfileCard";
import { type SessionRow, SessionsCard } from "@/components/account/SessionsCard";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { requirePageAuth } from "@/utils/require-page-auth";

export default async function AccountPage() {
  const session = await requirePageAuth();
  const user = session.user as typeof session.user & { username?: string | null };
  const sessions = await auth.api.listSessions({ headers: await headers() });

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-heading font-semibold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </header>

      <div className="space-y-4">
        <ProfileCard
          name={user.name ?? ""}
          username={user.username ?? ""}
          email={user.email ?? ""}
        />
        <PasswordCard />
        <SessionsCard sessions={sessions as SessionRow[]} currentToken={session.session.token} />
        <DeleteAccountCard />
      </div>

      <Separator />

      <p className="text-xs text-muted-foreground text-center">
        Momentum v{process.env.NEXT_PUBLIC_APP_VERSION}
      </p>
    </div>
  );
}
