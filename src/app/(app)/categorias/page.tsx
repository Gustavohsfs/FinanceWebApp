import type { Metadata } from "next";

import { CategoriesView } from "@/features/categories";

export const metadata: Metadata = { title: "Categorias — Fluxo" };

export default function CategoriasPage() {
  return <CategoriesView />;
}
