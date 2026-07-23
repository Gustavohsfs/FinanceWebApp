import type { User } from "@/core/api/types";
import { Card } from "@/shared/ui/card";

import { PasswordForm } from "./password-form";
import { SessionsCard } from "./sessions-card";

interface SettingsViewProps {
  user: User;
}

export function SettingsView({ user }: SettingsViewProps) {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <Card>
        <Card.Header>
          <Card.Title>Perfil</Card.Title>
        </Card.Header>
        <Card.Body className="flex flex-col gap-2 text-small">
          <div className="flex justify-between">
            <span className="text-bone-600">Nome</span>
            <span className="text-bone">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bone-600">E-mail</span>
            <span className="text-bone">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bone-600">Fuso horário</span>
            <span className="text-bone">{user.timezone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bone-600">Moeda</span>
            <span className="text-bone">{user.currency}</span>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Senha</Card.Title>
        </Card.Header>
        <Card.Body>
          <PasswordForm />
        </Card.Body>
      </Card>

      <SessionsCard />
    </div>
  );
}
