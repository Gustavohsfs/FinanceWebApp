import { redirect } from "next/navigation";

import { authApi, insightsApi } from "@/core/api/resources";
import { getSession } from "@/core/auth/session";
import { currentMonthKey } from "@/core/format/date";
import { formatMoney } from "@/core/format/money";
import { CommandBar } from "@/features/command-bar";
import { Sidebar } from "@/shared/layout/sidebar";
import { AppShellClient } from "@/shared/layout/app-shell-client";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user, summary] = await Promise.all([
    authApi.me(session.accessToken).catch(() => null),
    insightsApi.summary(session.accessToken, currentMonthKey()).catch(() => null),
  ]);

  if (!user) redirect("/login");

  const balanceLabel = summary ? formatMoney(summary.balanceCents) : "—";

  return (
    <div className="flex h-screen">
      <Sidebar userName={user.name} balanceLabel={balanceLabel} />
      <AppShellClient userName={user.name} userEmail={user.email}>
        {children}
      </AppShellClient>
      <CommandBar />
    </div>
  );
}
