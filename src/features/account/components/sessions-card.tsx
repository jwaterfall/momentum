"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

import type { AccountSession } from "../services";

export function SessionsCard({ sessions }: { sessions: AccountSession[] }) {
  const router = useRouter();
  const [revoking, setRevoking] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const revoke = async (token: string) => {
    setRevoking(token);
    await authClient.revokeSession({ token });
    setRevoking(null);
    router.refresh();
  };

  const signOut = async () => {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/auth/sign-in");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>Devices currently signed in to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Monitor className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">{session.device}</span>
              </div>
              {session.isCurrent ? (
                <Button variant="outline" size="sm" disabled={signingOut} onClick={signOut}>
                  Sign out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={revoking === session.token}
                  onClick={() => revoke(session.token)}
                >
                  Revoke
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
