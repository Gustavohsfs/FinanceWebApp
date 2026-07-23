"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { labelForPathname } from "./nav-items";
import { Topbar } from "./topbar";

interface AppShellClientProps {
  userName: string;
  userEmail: string;
  children: ReactNode;
}

export function AppShellClient({ userName, userEmail, children }: AppShellClientProps) {
  const pathname = usePathname();
  const title = labelForPathname(pathname);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Topbar title={title} userName={userName} userEmail={userEmail} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
