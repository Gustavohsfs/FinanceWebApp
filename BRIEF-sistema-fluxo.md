# BRIEF MESTRE UNIFICADO — Fluxo

> Documento de Spec-Driven Development do **sistema inteiro**: mobile (Expo), API (NestJS) e o novo app **web (Next.js)**.
> Substitui e absorve `BRIEF-app-financeiro.md` e `BRIEF-api-financeira.md`, que passam a ser anexos históricos.
> Vive em `docs/BRIEF.md` na raiz do monorepo.

---

## 0. Como usar

1. Este documento descreve o sistema. Cada app tem seu `CLAUDE.md` próprio, derivado das seções 12 e 13.
2. Feature nova nasce em `docs/specs/NN-nome.md` com critérios de aceite antes de virar código.
3. **A API é a dona da verdade financeira.** Mobile e web exibem; o servidor decide. Nenhum dos dois clientes recalcula saldo, parcela, orçamento ou progresso de meta para exibição autoritativa.
4. Camada de prompting (`CLAUDE.md`, `docs/specs/`, `.claude/`) fora do repo público via `.git/info/exclude` — mesmo padrão do ghtpromo.

---

## 1. O sistema

Três superfícies, uma verdade.

```
                    ┌─────────────────────┐
                    │   apps/api (Nest)   │
                    │   Cloud Run · SP    │
                    └──────────┬──────────┘
                               │ REST /v1 · OpenAPI
                 ┌─────────────┴─────────────┐
                 │                           │
        ┌────────▼────────┐         ┌────────▼────────┐
        │  apps/mobile    │         │   apps/web      │
        │  Expo · RN      │         │   Next.js       │
        │  registro rápido│         │   análise densa │
        └─────────────────┘         └─────────────────┘
```

**Divisão de papéis — isto é decisão de produto, não acaso:**

| | Mobile | Web |
|---|---|---|
| Momento de uso | No caixa do mercado, 5 segundos | Domingo à noite, 20 minutos |
| Job principal | **Registrar** | **Entender e planejar** |
| Métrica-mãe | Tempo até o gasto salvo (< 5s) | Densidade de informação sem ruído |
| Entrada | Teclado numérico próprio, chips | Command bar com linguagem natural |
| Gráfico | Um por vez, dedo arrastando | Vários, cruzando entre si |

O web **não é o mobile esticado**. Ele tem teclado físico, hover, e 1400px de largura — e a UI tem que gastar isso em densidade e cruzamento de dados, não em cards gigantes espaçados.

---

## 2. Monorepo

**Turborepo + pnpm workspaces.**

```
fluxo/
├── apps/
│   ├── api/            # NestJS 11 + Fastify + Prisma 7 + Neon
│   ├── mobile/         # Expo SDK 57 + NativeWind
│   └── web/            # Next.js 16 + Tailwind v4  ← este brief
├── packages/
│   ├── domain/         # money (centavos), parcelamento, competência, schemas zod
│   ├── api-client/     # client tipado gerado do OpenAPI da API
│   ├── tokens/         # tokens de design em JSON, fonte única das 3 superfícies
│   └── config/         # eslint, tsconfig, prettier compartilhados
├── docs/
│   ├── BRIEF.md
│   └── specs/
└── turbo.json
```

`packages/domain` é o que justifica o monorepo: o `splitInstallments` que garante que 3x de R$ 1.000 soma exatamente R$ 1.000 é **o mesmo código** nos três lugares. Regra de dinheiro tem um dono só.

`packages/tokens` é novo e importa aqui: as cores e a escala tipográfica saem de um JSON, que gera as variáveis CSS do web e o preset do NativeWind do mobile. Trocar o laranja em um lugar muda nos dois apps. Sem isso, os dois divergem em três meses.

---

## 3. O que já está decidido (resumo)

### 3.1 Mobile — `apps/mobile`

Expo SDK 57 (RN 0.86, React 19.2), TypeScript strict, Expo Router (Drawer + Stack + modais), NativeWind, react-native-reusables, victory-native + Skia para gráficos, TanStack Query + Zustand, react-hook-form + zod, FlashList, MMKV + SecureStore.

Assinaturas: **teclado de valor próprio** no sheet de registro rápido, e **scrubber háptico** no gráfico de linha.

### 3.2 API — `apps/api`

NestJS 11 + Fastify, Node 22, Prisma 7 + `@prisma/adapter-pg`, Neon Postgres (São Paulo), zod + nestjs-zod, JWT access 15min + refresh opaco rotativo com detecção de reuso, argon2id, pino, `@nestjs/schedule`, throttler, RFC 9457 para erros, OpenAPI gerado do zod.

Três camadas: `Controller → Service → Repository`. Dependência em sentido único.

Deploy: Cloud Run `southamerica-east1` (free tier) na fase inicial, Fly.io `gru` quando o tráfego justificar. Crons viram endpoints `POST /internal/jobs/:name` disparados por Cloud Scheduler enquanto estiver em Cloud Run.

### 3.3 Domínio (vale para os três)

- **Dinheiro é `Int` em centavos.** Nunca float. Formatação só na borda de apresentação.
- **Parcelamento** gera N linhas com o mesmo `installmentGroupId`; a soma fecha exata; parcelas futuras nascem `isProjected: true`.
- **Competência × caixa**: `occurredAt` vs `settledAt`. Toggle global, padrão competência.
- **Timezone** `America/Sao_Paulo` em toda agregação. Gasto às 22h de 31/jul é de julho.
- **Soft delete** em tudo. **Idempotency-Key** em toda criação.
- Entidades: `User`, `Transaction`, `Category`, `Account`, `CreditCard`, `Goal`, `Recurrence`.

---

## 4. Stack do web

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js 16.2.x**, App Router, `src/` | Turbopack default, React 19.2, Cache Components. Confirmar o patch atual na instalação — não assumir |
| Linguagem | TypeScript strict (mesmo tsconfig do monorepo) | |
| Estilo | **Tailwind CSS v4** | CSS-first config via `@theme`, alinhado ao que você já usa no ghtpromo |
| Componentes | **shadcn/ui** (copy-paste, você é dono do código) | Casa com Tailwind e com o react-native-reusables do mobile — mesma linhagem, mesma mentalidade |
| Ícones | `lucide-react` | Idêntico ao mobile |
| Gráficos | **Recharts**, via `shadcn/ui chart` | SSR-compatível com App Router (ECharts e ApexCharts exigem client-only), API declarativa, é o padrão de fato em dashboards React. O componente `chart` do shadcn já resolve theming via CSS vars |
| Estado servidor | **TanStack Query v5** | Prefetch no Server Component, hidratação no client |
| Estado UI | **Zustand** | Filtros, período, densidade. Só UI — nunca dado de servidor |
| Formulários | react-hook-form + zod (schemas de `packages/domain`) | Mesmo par do mobile |
| Command bar | **cmdk** | Base da assinatura do produto (seção 6.3) |
| Tabelas | **TanStack Table v8** | Lançamentos com sort, filtro e coluna configurável |
| Datas | date-fns + `@date-fns/tz` | Mesmo do mobile |
| Animação | **Motion** (ex-Framer Motion), com parcimônia | Só onde comunica estado; ver seção 6.5 |
| Toast | **Sonner** | |
| Deploy | **Vercel** | Mesmo fluxo do ghtpromo |

**Sem testes** — nem unitários, nem E2E, conforme combinado. Em compensação, `typecheck` e `lint` são bloqueantes no CI e o código é escrito testável (lógica pura fora de componente).

> Atenção do agente: Next.js 16 renomeou `middleware.ts` para `proxy.ts` e tornou `params`/`searchParams` assíncronos. Verificar na documentação vigente antes de escrever o primeiro arquivo — snippets de blog com mais de seis meses quebram em build novo.

---

## 5. Estrutura de pastas do web

Feature-first, espelhando o mobile para que quem navega em um se localize no outro.

```
apps/web/src/
├── app/
│   ├── layout.tsx                    # fontes, providers, html lang="pt-BR"
│   ├── globals.css                   # @theme do Tailwind v4 — tokens vindos de packages/tokens
│   ├── (auth)/
│   │   ├── layout.tsx                # split screen: form + painel visual
│   │   ├── login/page.tsx
│   │   └── registrar/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                # sidebar + topbar + command bar + guard
│   │   ├── page.tsx                  # Dashboard
│   │   ├── lancamentos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── categorias/page.tsx
│   │   ├── entradas/page.tsx
│   │   ├── metas/page.tsx
│   │   ├── contas/page.tsx
│   │   ├── relatorios/page.tsx
│   │   └── configuracoes/page.tsx
│   └── api/                          # BFF — ver seção 8
│       ├── auth/[...action]/route.ts
│       └── proxy/[...path]/route.ts
│
├── features/                         # { api, components, hooks, schemas, types, index.ts }
│   ├── auth/
│   ├── transactions/
│   ├── categories/
│   ├── goals/
│   ├── accounts/
│   ├── dashboard/
│   └── reports/
│
├── shared/
│   ├── ui/                           # shadcn/ui — primitivos, sem regra de negócio
│   ├── components/                   # compostos: MoneyText, PeriodPicker, CategoryBadge, EmptyState
│   ├── charts/                       # wrappers do Recharts com tokens e crosshair
│   ├── layout/                       # Sidebar, Topbar, CommandBar
│   └── hooks/
│
└── core/
    ├── api/                          # fetch tipado, mapeamento de erro RFC 9457
    ├── auth/                         # sessão, cookies, guard
    ├── query/                        # QueryClient, prefetch helpers
    ├── config/                       # env validada com zod
    └── format/                       # BRL, datas, percentuais
```

Regra de dependência: `app/ → features/ → shared/ → core/`. Nunca o contrário. Feature não importa de outra feature — o comum sobe para `shared/`.

---

## 6. Design

Paleta e tipografia **herdadas do mobile, sem negociação** — quem usa os dois tem que sentir que é o mesmo produto.

### 6.1 Tokens

```css
@theme {
  --color-ink-950:   #08080A;   /* fundo */
  --color-ink-900:   #101014;   /* superfície / card */
  --color-ink-850:   #16161C;   /* superfície elevada — exclusivo do web, para densidade */
  --color-ink-800:   #1A1A20;   /* borda */
  --color-ink-600:   #2A2A33;   /* divisória */

  --color-flame-500: #FF6A00;   /* primária · saída · ação */
  --color-flame-400: #FF8A2B;   /* hover / pressed */
  --color-flame-950: #241000;   /* fundo tingido */

  --color-bone:      #FFFFFF;   /* texto primário */
  --color-bone-600:  #A1A1AA;   /* secundário */
  --color-bone-800:  #52525B;   /* desabilitado */

  --color-mint:      #2FBF71;   /* entrada · meta batida — só indicador pequeno */
  --color-ember:     #E5484D;   /* estouro · saldo negativo — só indicador pequeno */
}
```

Dark-only. Não construir tema claro nesta fase: dobra o custo de cada componente e ninguém abre app de finanças às 14h num escritório iluminado esperando fundo branco. Fica registrado como decisão em aberto, não como omissão.

**Regra cromática:** laranja é saída e ação. Branco é neutro e entrada nos gráficos. Verde e vermelho só pontuam — nunca preenchem área grande. Um dashboard com verde e vermelho por toda parte vira semáforo e o usuário para de ler.

### 6.2 Tipografia

Mesmos três papéis do mobile, via `next/font/google`:

| Papel | Fonte | Uso no web |
|---|---|---|
| Display | **Sora** 600/700 | Título de tela, valor herói do dashboard |
| Interface | **Inter** 400/500/600 | Corpo, labels, botões, navegação |
| Numérico | **JetBrains Mono** 500 | Toda coluna de valor, eixo de gráfico, readout do crosshair |

Escala web (maior que a mobile, o monitor comporta): 56 / 36 / 24 / 18 / 15 / 13 / 11.
`font-variant-numeric: tabular-nums` obrigatório em qualquer número em coluna ou que muda no hover. Valor que "pula" ao trocar de dígito é bug visual em software financeiro.

### 6.3 Assinatura 1 — Command bar que entende português

`⌘K` / `Ctrl+K` abre a barra. Ela faz duas coisas:

1. **Navega** — "metas", "categorias", "julho" pulam direto.
2. **Registra** — o usuário digita `45,90 mercado crédito 3x` e a barra monta a transação ao vivo, mostrando abaixo, em chips, o que entendeu: `R$ 45,90` · `Mercado` · `Crédito` · `3× de R$ 15,30`. Enter salva.

O parser é uma função pura em `features/transactions/lib/parse-entry.ts`: extrai valor (primeiro número com vírgula ou ponto), casa categoria por similaridade com as categorias do usuário, detecta método por palavra-chave (`pix`, `débito`, `crédito`, `dinheiro`), e parcela por regex `\b(\d{1,2})x\b`. O que não reconhece vira descrição. Nada é obrigatório além do valor.

Isto é o equivalente desktop do teclado de valor do mobile: o caminho mais curto entre a intenção e o dado salvo. É onde toda a ousadia do produto é gasta.

### 6.4 Assinatura 2 — Crosshair sincronizado no dashboard

Aqui vai o risco estético deliberado: **o dashboard não abre com uma fileira de cards de KPI.** Essa é a resposta template de todo dashboard financeiro, e ela desperdiça a única coisa que o desktop tem de melhor — poder mostrar relação entre números, não números soltos.

Em vez disso, o herói é o **gráfico de área do saldo do mês ocupando toda a largura**, com os números vivendo *dentro* dele:

```
┌──────────────────────────────────────────────────────────────┐
│  julho 2026        competência ▾                    ⌘K       │
│                                                              │
│   R$ 3.240,18          ╭──╮                                  │
│   saldo em 23 jul     ╱    ╰─╮      ╭─╮                      │
│   ↑ entradas 5.800   ╱        ╰────╯   ╰──╮                  │
│   ↓ saídas   2.559  ╱                      ╰───              │
│  ─────────────────┼────────────┼───────────────┼──────       │
│    01              08          15              22            │
└──────────────────────────────────────────────────────────────┘
```

Ao mover o mouse sobre a área, uma hairline laranja acompanha o cursor e **os três números da esquerda se recalculam para aquele dia**. O saldo grande deixa de ser um card estático e vira um instrumento de leitura. Sair com o mouse volta para hoje.

Abaixo dele, e só abaixo, vêm os blocos densos: donut por categoria (clicar filtra a lista), barras de 6 meses, orçamentos estourados (só aparece se houver), últimos lançamentos.

Todo o resto da interface fica quieto e disciplinado para que essas duas assinaturas respirem.

### 6.5 Movimento

Pouco e com função:
- Transição de rota: fade de 120ms. Nada de slide.
- Número que muda: `tabular-nums` + transição de cor de 80ms, sem contador animado. Contador que sobe de zero é bonito uma vez e irritante nas outras cem.
- Crosshair e hover: instantâneos, sem easing. Latência percebida em instrumento de leitura é falha.
- Sheet e dialog: 150ms ease-out.
- `prefers-reduced-motion` respeitado globalmente.

### 6.6 Voz da interface

Herdada do mobile: verbo ativo, sentence case, sem simpatia postiça.
Botão diz o que acontece — "Salvar gasto", não "Confirmar". Erro explica o que fazer — "Valor precisa ser maior que zero", não "Ocorreu um erro". Vazio convida — "Nenhum gasto em julho. Registre o primeiro." O nome da ação não muda no meio do fluxo: o botão "Publicar" produz o toast "Publicado".

### 6.7 Navegação

Espelha o mobile para não exigir dois modelos mentais:

- **Sidebar esquerda fixa**, colapsável para ícones (`[`): Dashboard · Lançamentos · Categorias · Entradas · Metas · Contas e cartões · Relatórios · Configurações. Rodapé com usuário e saldo consolidado.
- **Topbar**: seletor de período, toggle competência/caixa, gatilho da command bar, avatar.
- **Atalhos de teclado** (documentados em `?`): `n` novo lançamento · `/` buscar · `g d` dashboard · `g l` lançamentos · `j`/`k` navegar na lista · `[` colapsar sidebar.

---

## 7. Features do web

| Tela | O que entrega | Aceite |
|---|---|---|
| **Login / Registro** | Split screen: formulário à esquerda, painel à direita com o gráfico de saldo em loop suave e translúcido. Erro inline, nunca toast | Sessão persiste em reload; rota protegida redireciona com `?next=` |
| **Dashboard** | Seção 6.4 na íntegra | Crosshair recalcula os três números; donut filtra a lista; cada bloco tem estado vazio desenhado |
| **Lançamentos** | TanStack Table: sort, filtro por período/categoria/método/conta, coluna configurável, seleção múltipla, edição inline do valor. Paginação por cursor com scroll infinito | Editar parcela pergunta escopo (só esta / esta e futuras / todas) |
| **Categorias** | Grid de cards com ícone, cor, orçamento mensal e barra de consumo do mês. Criar e editar em sheet lateral | Categoria com histórico só arquiva, nunca exclui |
| **Entradas** | Mesma máquina, `type=INCOME`. Recorrentes em seção própria, com previstos confirmáveis em um clique | Recorrência mensal aparece como previsto e vira efetivado |
| **Metas** | Três tipos (guardar, investir, limite de gasto). Cada uma com barra de progresso, planejado × efetivado e projeção em linguagem natural: "no ritmo atual você chega em out/26, 2 meses depois do alvo" | Comparativo do mês visível sem entrar no detalhe |
| **Contas e cartões** | Cartão com limite, fechamento, vencimento e fatura do mês em destaque | Fatura aberta × fechada visualmente distintas |
| **Relatórios** | Cruzamento por categoria × método × período. Exportação CSV | Período customizado livre |
| **Configurações** | Perfil, senha, sessões ativas (revogar), preferências | Revogar sessão derruba o dispositivo |

Transversal: **projetado é visualmente distinto de efetivado** em toda superfície — parcela futura e recorrência prevista aparecem com opacidade reduzida e borda tracejada. Confundir os dois é o erro mais caro que um app de finanças comete.

---

## 8. Integração com a API

### 8.1 Autenticação — padrão BFF

**Decisão central: o navegador nunca vê o token.**

Guardar JWT em `localStorage` é o caminho mais curto para XSS virar roubo de sessão. Em vez disso, o Next.js atua como Backend-for-Frontend:

```
Browser ──cookie httpOnly──▶ Next.js (Route Handler) ──Bearer──▶ Nest API
```

- `POST /api/auth/login` (Route Handler) recebe email e senha, chama `POST /v1/auth/login` na API, e grava `access` e `refresh` em cookies **`httpOnly`, `Secure`, `SameSite=Lax`**.
- `/api/proxy/[...path]` encaminha as chamadas do client anexando o Bearer a partir do cookie. O client chama `/api/proxy/transactions`, nunca a URL da API.
- **Server Components** leem o cookie via `cookies()` e chamam a API diretamente, sem passar pelo proxy.
- Refresh transparente: se a API devolver 401, o Route Handler tenta o refresh uma vez, regrava os cookies e repete. Falhou o refresh → limpa cookies e devolve 401, e o client manda para `/login`.
- `proxy.ts` (o antigo middleware) protege o grupo `(app)`: sem cookie de sessão, redireciona para `/login?next=<rota>`.

Efeito colateral bom: a URL da API nunca é exposta ao navegador, e `NEXT_PUBLIC_*` não precisa carregar nada sensível.

### 8.2 Busca de dados — três mecanismos, três regras

Sem improviso. A regra é esta e não tem exceção sem spec:

| Situação | Mecanismo |
|---|---|
| Dado inicial da página | **Server Component** chama a API direto, faz `prefetchQuery` e entrega via `HydrationBoundary` |
| Mutação e refetch interativo | **TanStack Query** via `/api/proxy/*`, com update otimista |
| Login, logout, refresh | **Route Handler** (precisa gravar cookie `httpOnly`) |

Isso dá primeira pintura server-side (rápida, indexável, sem spinner) e interatividade completa depois da hidratação, sem duplicar cliente HTTP.

### 8.3 Contrato

- `packages/api-client` é **gerado do `openapi.json`** da API. Ninguém escreve tipo de request na mão. Contrato mudou → regenera → o TypeScript aponta o que quebrou.
- Erros chegam em `application/problem+json` (RFC 9457). `core/api/errors.ts` mapeia o campo `code` — que é o contrato estável — para mensagem em português. `title` e `detail` da API são para log, não para o usuário.
- Toda criação envia `Idempotency-Key` (UUID gerado no client). Duplo clique no botão "Salvar" não vira dois lançamentos.
- Chaves do React Query padronizadas: `['transactions', { from, to, filters }]`. Invalidação por prefixo.

---

## 9. Padrões de código

### 9.1 Server vs Client

**Server Component é o default.** `'use client'` só na folha que realmente precisa de estado, evento ou hook de browser — e o mais fundo possível na árvore. Uma página que vira client inteira por causa de um botão joga fora a metade boa do App Router.

Padrão: `page.tsx` (server, busca dado) → `FeatureView` (server, compõe) → `InteractiveBit` (client, só a parte viva).

### 9.2 Componentização

- **Um componente, um trabalho.** Se o nome precisa de "e" para descrever, são dois.
- **Composição, não configuração.** Nada de `<Card variant="withHeaderAndActions" />`. Slots: `<Card><Card.Header/><Card.Body/></Card>`.
- **Variantes com CVA** (`class-variance-authority`), nunca ternário de classe espalhado no JSX.
- **`shared/ui` não conhece domínio.** `Button` não sabe o que é transação. Se precisou saber, o lugar é `features/*/components`.
- **Props explícitas.** Sem `{...props}` cego — some a rastreabilidade e entra atributo indevido no DOM.
- **Sem barrel gigante.** `index.ts` por feature, exportando o que é público. Barrel de `shared/ui` inteiro atrapalha tree-shaking.
- **Componente acima de ~150 linhas é sinal de extração**, não regra rígida — mas o agente deve olhar para ele.

### 9.3 Enxuto e consistente

- Nome de arquivo `kebab-case.tsx`; componente `PascalCase`; hook `useX`; schema zod `xSchema`; server action `xAction`.
- Português nas strings de UI, inglês no código. Sem mistura.
- Sem comentário que narra o óbvio. Comentário explica *por que*, não *o quê*.
- Sem abstração especulativa. Duas ocorrências não fazem um padrão; três fazem.
- Formatação de dinheiro em **um lugar só**: `core/format/money.ts`. Nenhum `toLocaleString` solto pelo código.

---

## 10. Guardrails do web

Invioláveis. O agente trata como falha:

1. Nenhum `float` em dinheiro. Centavos inteiros, sempre, vindos de `packages/domain`.
2. Nenhum token em `localStorage`, `sessionStorage` ou cookie legível por JS.
3. Nenhuma chamada direta do browser para a URL da API. Sempre via BFF.
4. Nenhum `'use client'` em `page.tsx` ou `layout.tsx`.
5. Nenhum dado de servidor no Zustand.
6. Nenhuma cor ou tamanho de fonte hardcoded. Só tokens.
7. Nenhum número em coluna sem `tabular-nums`.
8. Nenhum valor projetado indistinguível de efetivado.
9. Nenhuma tela sem estado de loading, erro e vazio.
10. Nenhum `any`. `unknown` + narrowing.
11. Nenhum segredo em variável `NEXT_PUBLIC_*`.
12. Nenhum cálculo financeiro autoritativo no client — só formatação e projeção rotulada como projeção.

---

## 11. Vercel — estrutura e publicação

Espelhando o fluxo do ghtpromo:

**Projeto e domínio**
- Projeto Vercel apontando para `apps/web` no monorepo (Root Directory = `apps/web`, framework Next.js detectado automaticamente).
- Domínio `.com.br` no Registro.br com **delegação completa de nameservers para a Vercel** — mesmo caminho já validado no ghtpromo, evita a dor de gerenciar registros A/CNAME na mão.
- `app.dominio.com.br` para produção; preview deploys ganham URL automática por PR.

**Ambientes e variáveis**

| Variável | Escopo | Observação |
|---|---|---|
| `API_URL` | server | URL do Cloud Run. **Sem** `NEXT_PUBLIC_` |
| `AUTH_COOKIE_SECRET` | server | Assinatura dos cookies de sessão |
| `NEXT_PUBLIC_APP_URL` | client | Só para links absolutos |

Três ambientes: Production, Preview e Development, cada um com seu `API_URL`. Preview aponta para a API de staging, nunca para produção — preview de PR gravando na base real é acidente esperando data.

**Build**
- `turbo.json` com pipeline `build` dependendo de `^build`, para `packages/domain` e `api-client` compilarem antes.
- Ignored Build Step: `npx turbo-ignore` — evita rebuild do web quando o commit só tocou o mobile.
- `next.config.ts` com `transpilePackages` para os pacotes internos.
- CI bloqueante: `lint` + `typecheck`. Sem testes, esses dois são a única rede.

**Runtime**
- Node runtime (não Edge): o BFF conversa com a API em São Paulo e o Edge não traz ganho aqui — traz complexidade.
- Região da função: `gru1` (São Paulo), para o BFF ficar perto da API e do Neon.

---

## 12. Configuração do Claude Code — web

### 12.1 `apps/web/CLAUDE.md`

Curto: stack e versões travadas; regra de dependência entre camadas; os 12 guardrails da seção 10; a regra Server-vs-Client da 9.1; as três regras de busca de dados da 8.2; convenções de nome da 9.3; Conventional Commits; e "leia `docs/BRIEF.md` e a spec da fase corrente antes de escrever código".

### 12.2 Skills — `.claude/skills/`

| Skill | Dispara quando | Conteúdo |
|---|---|---|
| **`next-architecture`** | criar rota, layout, página, mover arquivo, discutir estrutura | App Router, route groups, fronteira server/client, `params` assíncronos, `proxy.ts`, streaming e Suspense, onde cada tipo de arquivo mora |
| **`design-system-web`** | qualquer JSX ou classe Tailwind | tokens da 6.1, escala tipográfica da 6.2, regra cromática do laranja, inventário de `shared/ui`, quando compor vs quando criar, regras de movimento da 6.5 |
| **`recharts-dashboard`** | qualquer gráfico | wrappers de `shared/charts`, padrão do crosshair sincronizado, `ChartContainer` do shadcn, cores por CSS var, formatação de eixo com `tabular-nums`, estados vazio e carregando de gráfico |
| **`api-integration`** | qualquer fetch, hook de query, Route Handler | padrão BFF, cookies httpOnly, as três regras da 8.2, chaves do React Query, mapeamento de erro RFC 9457, `Idempotency-Key`, update otimista |
| **`money-domain`** | valor, parcela, meta, agregação | *compartilhada com mobile e API* — centavos, `splitInstallments`, competência × caixa, formatação BRL, projetado × efetivado |
| **`component-craft`** | criar ou refatorar componente | regras da 9.2: composição sobre configuração, CVA, slots, limites de `shared/ui`, quando extrair, props explícitas |
| **`command-bar`** | mexer no parser ou na barra `⌘K` | gramática aceita, ordem de resolução (valor → parcela → método → categoria → descrição), casos ambíguos, feedback em chips, atalhos globais |
| **`rsc-performance`** | bundle, import dinâmico, lista grande | manter `'use client'` na folha, `next/dynamic` para o que é pesado (tabela, gráfico secundário), `next/font`, o que não pode cruzar a fronteira serializável |
| **`vercel-deploy`** | build, env, config, deploy | root directory no monorepo, `turbo-ignore`, matriz de variáveis, região `gru1`, preview apontando para staging |

Frontmatter específico é o que faz a skill disparar na hora certa:

```yaml
---
name: recharts-dashboard
description: Use sempre que houver gráfico, visualização de dados, dashboard ou componente em shared/charts. Dispara também em qualquer discussão sobre Recharts, eixos, tooltip, crosshair ou formatação de valores em gráfico.
---
```

### 12.3 Subagents — `.claude/agents/`

- **`spec-writer`** — pedido vira spec com critérios de aceite. Não escreve código. *(compartilhado)*
- **`web-ui-builder`** — implementa UI a partir do design system. Não inventa cor, fonte nem espaçamento fora dos tokens.
- **`dashboard-composer`** — especializado nas telas de dado denso: hierarquia visual, o que merece destaque, o que vira detalhe, densidade sem ruído.
- **`api-integrator`** — hooks de query, Route Handlers, tratamento de erro, retry, otimismo. *(compartilhado com mobile)*
- **`money-reviewer`** — os guardrails financeiros; roda antes de commit que toque em valor. *(compartilhado)*
- **`a11y-reviewer`** — foco visível, ordem de tabulação, `aria-label` em ícone-só, contraste do laranja sobre preto (checar AA), `prefers-reduced-motion`.

### 12.4 Slash commands — `.claude/commands/`

- `/spec <feature>` — gera `docs/specs/NN-feature.md`.
- `/route <caminho>` — cria rota do App Router com `page.tsx` server, `loading.tsx`, `error.tsx` e estado vazio.
- `/component <nome>` — componente seguindo as regras da 9.2, com CVA se tiver variante.
- `/chart <tipo>` — wrapper de gráfico em `shared/charts` já com tokens, crosshair e estados.
- `/feature <nome>` — esqueleto completo da feature com barrel.
- `/review-money` — dispara o `money-reviewer` no diff.

---

## 13. Roadmap do web

| Fase | Entrega | Pronto quando |
|---|---|---|
| 0 | Scaffolding: Next 16, Tailwind v4, tokens de `packages/tokens`, fontes, ESLint, estrutura de pastas, projeto Vercel | Deploy de preview no ar com página em branco e as três fontes carregadas |
| 1 | Design system: `shared/ui` do shadcn + compostos (MoneyText, PeriodPicker, EmptyState, CategoryBadge) | Rota `/dev` mostrando todos os componentes em todos os estados |
| 2 | Auth + shell: BFF completo, `proxy.ts`, sidebar, topbar, atalhos | Login persiste em reload; rota protegida redireciona com `?next=`; refresh transparente funciona |
| 3 | Lançamentos: tabela, filtros, edição com escopo, integração via `api-client` | Parcelamento edita com as três opções de escopo |
| 4 | Command bar: navegação + parser de registro | `45,90 mercado crédito 3x` salva a transação correta |
| 5 | Dashboard: gráfico herói com crosshair sincronizado, donut, barras, orçamentos | Crosshair recalcula os três números; donut filtra a lista |
| 6 | Categorias, entradas, contas e cartões | Recorrência de salário confirma em um clique |
| 7 | Metas e relatórios | Projeção em linguagem natural; exportação CSV |
| 8 | Polimento: acessibilidade, estados vazios, movimento, densidade, atalhos documentados | `a11y-reviewer` limpo; `prefers-reduced-motion` respeitado |

---

## 14. Definition of Done (toda tela do web)

- [ ] TypeScript sem erro, sem `any`; lint limpo
- [ ] Guardrails da seção 10 respeitados
- [ ] Server Component por padrão; `'use client'` só na folha
- [ ] Estados de loading, erro e vazio desenhados
- [ ] Só tokens — zero cor, fonte ou espaçamento hardcoded
- [ ] `tabular-nums` em todo número em coluna
- [ ] Projetado visualmente distinto de efetivado
- [ ] Navegável por teclado, foco visível, ícone-só com `aria-label`
- [ ] Responsivo até 768px (o web não precisa competir com o mobile abaixo disso, mas não pode quebrar)
- [ ] Conventional Commit

---

## 15. Decisões em aberto

- **Tema claro** — adiado conscientemente. Se entrar, os tokens de `packages/tokens` já estão preparados para dois conjuntos; o custo é revisar cada componente.
- **PWA / instalável** — o web instalado no desktop cobriria parte do caso do mobile. Avaliar depois da fase 8, não antes.
- **Exportação PDF de relatório** — provável demanda. Manter `features/reports` desacoplado da renderização para permitir uma segunda saída.
- **Realtime** — se um dia mobile e web abertos ao mesmo tempo precisarem refletir mudança instantânea, SSE na API é mais barato que WebSocket. Não é necessidade hoje.
- **`packages/tokens` como fonte única** — precisa ser construído na fase 0 do web, mas exige um pequeno refactor do mobile para consumir dele em vez de ter os tokens locais. Fazer antes que os dois divirjam.
