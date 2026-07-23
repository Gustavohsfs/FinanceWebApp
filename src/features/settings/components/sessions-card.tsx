"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

export function SessionsCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRevokeAll() {
    setLoading(true);
    await fetch("/api/auth/logout-all", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Sessões</Card.Title>
        <Card.Description>
          Encerra o acesso deste e de todos os outros dispositivos conectados à sua conta.
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <Button variant="destructive" onClick={handleRevokeAll} disabled={loading}>
          {loading ? "Encerrando…" : "Encerrar todas as sessões"}
        </Button>
      </Card.Body>
    </Card>
  );
}
