import { TriangleAlert } from "lucide-react";

import { Button } from "@/shared/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-ember/30 bg-ember/5 px-10 py-14 text-center">
      <TriangleAlert className="size-6 text-ember" />
      <p className="text-body text-bone">{message ?? "Não foi possível carregar os dados."}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
