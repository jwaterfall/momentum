import { headers } from "next/headers";
import "server-only";

import { auth } from "@/lib/auth";

export type AccountProfile = {
  name: string;
  username: string;
  email: string;
};

export type AccountSession = {
  id: string;
  token: string;
  device: string;
  isCurrent: boolean;
};

export async function getAccount(): Promise<{
  profile: AccountProfile;
  sessions: AccountSession[];
}> {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const sessions = await auth.api.listSessions({ headers: headerList });

  return {
    profile: {
      name: session.user.name ?? "",
      username: session.user.username ?? "",
      email: session.user.email ?? "",
    },
    sessions: sessions.map((row) => ({
      id: row.id,
      token: row.token,
      device: row.userAgent ?? "Unknown device",
      isCurrent: row.token === session.session.token,
    })),
  };
}
