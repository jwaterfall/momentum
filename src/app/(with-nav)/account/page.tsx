import { PageHeader } from "@/components/page-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { DeleteAccountCard } from "@/features/account/components/delete-account-card";
import { PasswordCard } from "@/features/account/components/password-card";
import { ProfileCard } from "@/features/account/components/profile-card";
import { SessionsCard } from "@/features/account/components/sessions-card";
import { getAccount } from "@/features/account/services";
import { requirePageAuth } from "@/utils/require-page-auth";

export default async function AccountPage() {
  await requirePageAuth();
  const { profile, sessions } = await getAccount();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Account Settings"
        description="Manage your account and preferences"
        action={<ThemeToggle />}
      />

      <div className="space-y-4">
        <ProfileCard {...profile} />
        <PasswordCard />
        <SessionsCard sessions={sessions} />
        <DeleteAccountCard />
      </div>

      <Separator />

      <p className="text-xs text-muted-foreground text-center">
        Momentum v{process.env.NEXT_PUBLIC_APP_VERSION}
      </p>
    </div>
  );
}
