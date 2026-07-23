import { redirect } from "next/navigation";

import { getSession } from "@/core/auth/session";
import { AuthVisualPanel } from "@/shared/components/auth-visual-panel";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-flame-500" />
            <span className="font-display text-title font-semibold text-bone">Fluxo</span>
          </div>
          {children}
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-ink-900 lg:block">
        <AuthVisualPanel />
      </div>
    </div>
  );
}
