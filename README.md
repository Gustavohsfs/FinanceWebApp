# Fluxo — Web

App web do Fluxo (Next.js 16 + Tailwind v4), a superfície de análise densa do
sistema. Veja `BRIEF-sistema-fluxo.md` para o spec completo (arquitetura,
design system, guardrails).

## Rodando localmente

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env.local` e ajuste `API_URL` e `AUTH_COOKIE_SECRET`
(gere um valor aleatório com `openssl rand -hex 32` ou similar).

## Comandos

- `npm run dev` — servidor de desenvolvimento (Turbopack)
- `npm run build` — build de produção
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

## Deploy

Projeto Vercel `ghtpromo/fluxo-web`, produção em
`https://fluxo-web-seven.vercel.app`. Push em `main` dispara deploy automático
(GitHub conectado); variáveis de ambiente já configuradas em Production,
Preview e Development no dashboard da Vercel.
