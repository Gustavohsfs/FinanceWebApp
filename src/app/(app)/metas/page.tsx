import type { Metadata } from "next";

import { GoalsView } from "@/features/goals";

export const metadata: Metadata = { title: "Metas — Fluxo" };

export default function MetasPage() {
  return <GoalsView />;
}
