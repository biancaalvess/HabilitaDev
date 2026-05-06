# HabilitaDev

Front-end em Next.js (App Router) para prática de questões técnicas, integrado a uma API REST Java (Spring Boot) via camada BFF em Route Handlers.

---

## Português

### Visão geral

O repositório contém a aplicação web. O domínio de negócio (questões, respostas, comentários, contactos, pedidos de correção) é servido por um backend externo em `/api/v1`. O Next.js expõe rotas em `/api/proxy/*` que fazem proxy para esse backend, evitando expor a origem do Java no browser quando usas apenas variáveis de servidor e o prefixo de API interno.

O módulo `lib/api.ts` concentra chamadas HTTP: no cliente e em Server Actions usa o BFF; em Server Components podes optar por `serverGetQuestions` (fetch direto ao Spring) quando as variáveis de ambiente do servidor estiverem definidas.

### Requisitos

- Node.js 18 ou superior (o projeto declara tipos para Node 22 em devDependencies).
- Gestor de pacotes: o repositório fixa `pnpm` em `packageManager`; podes usar `npm` se ajustares o fluxo local.

### Instalação

```bash
pnpm install
cp .env.example .env.local
```

Edita `.env.local` com a URL real do Spring e a origem do Next (ver tabela abaixo). Alternativa:

```bash
pnpm run env:init
```

### Variáveis de ambiente

| Variável | Onde é lida | Função |
|----------|-------------|--------|
| `BACKEND_URL` | Servidor (Route Handlers, RSC com fetch direto) | URL base do Spring; prioridade máxima; não entra no bundle do cliente. |
| `NEXT_PUBLIC_API_URL` | Servidor e cliente | Se for `http(s)://`, trata-se da URL do Java (mesmo papel que `BACKEND_URL` / `NEXT_PUBLIC_BACKEND_URL` na resolução). Se for um path (ex.: `/api`), define o prefixo do BFF no cliente. |
| `NEXT_PUBLIC_BACKEND_URL` | Servidor e cliente | URL pública do Java quando não usas `BACKEND_URL` / `NEXT_PUBLIC_API_URL` como URL absoluta. |
| `NEXT_PUBLIC_APP_URL` | Servidor | Origem da app Next (ex.: `http://localhost:3001`) para `fetch` absoluto a `/api/proxy/*` em SSR. |

A resolução da URL do Java está em `lib/config-simple.ts` (`resolveJavaApiBaseUrl`, `resolveNextClientApiBase`). Em produção, o arranque valida HTTPS e ausência de localhost na URL do backend.

### Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento (porta 3001, host `0.0.0.0`). |
| `pnpm build` | Build de produção. |
| `pnpm start` | Servidor Next em modo produção. |
| `pnpm run env:init` | Cria `.env.local` a partir de `.env.example` se ainda não existir. |
| `pnpm run env:validate` | Verifica existência de `.env.local` ou `.env`. |
| `pnpm run check-backend` | Script auxiliar que confirma URL do backend nos ficheiros de ambiente. |
| `pnpm run clean:next` | Limpa artefactos `.next`. |

### Arquitetura

1. **Browser**: pedidos a `{NEXT_PUBLIC_APP_API_BASE ou /api}/proxy/...` (BFF).
2. **Route Handlers** (`app/api/proxy/**`): leem `config.api.backendUrl`, chamam o Spring em `/api/v1/...`, tratam erros e timeouts.
3. **Spring Boot**: contrato JSON (frequentemente `snake_case`); tipos em `lib/api.ts` alinhados com isso.

Autenticação: o ficheiro `lib/auth.tsx` define um contexto mínimo (sem utilizador); rotas de login OAuth descritas em documentação antiga podem não existir neste ramo. Valida `app/api` antes de assumir endpoints de auth.

### Estrutura relevante

- `app/` — páginas App Router, layouts, Route Handlers em `app/api/`.
- `components/` — UI (Radix, Tailwind, formulários, listas).
- `hooks/` — lógica de dados (ex.: SWR, questões).
- `lib/api.ts` — cliente HTTP, tipos de domínio, `apiService`, `getQuestions`, `createQuestion`, `serverGetQuestions`.
- `lib/config-simple.ts` — configuração de URLs e timeouts.
- `middleware/` — utilitários de erro (se aplicável ao teu deploy).

### Build e segurança

- Não inclua `.env`, `.env.local` nem segredos nos commits; apenas `.env.example` deve permanecer versionado.
- Define `JWT_SECRET` forte em produção; o repositório inclui valores de exemplo apenas para desenvolvimento.
- Para tráfego real, o backend Java deve estar em HTTPS e acessível a partir do ambiente onde corre o Next.

### Licença

O campo `license` não está definido em `package.json`; o pacote está marcado como `private`. Define uma licença explícita se tornares o repositório público com redistribuição permitida.

---

## English

### Overview

This repository contains the web application. Business logic (questions, answers, comments, contacts, correction requests) is provided by an external Java (Spring Boot) REST API under `/api/v1`. Next.js exposes `/api/proxy/*` Route Handlers that proxy to the Java service so the browser does not need the Spring origin when you rely on server-only env vars and the internal API prefix.

`lib/api.ts` centralizes HTTP: client code and Server Actions use the BFF; in Server Components you may use `serverGetQuestions` for a direct Spring `fetch` when server environment variables are set.

### Prerequisites

- Node.js 18 or newer (devDependencies target Node 22 types).
- Package manager: `pnpm` is pinned in `packageManager`; `npm` works if you adapt your workflow.

### Setup

```bash
pnpm install
cp .env.example .env.local
```

Edit `.env.local` with your Spring base URL and the Next origin (see table). Alternatively:

```bash
pnpm run env:init
```

### Environment variables

| Variable | Scope | Role |
|----------|-------|------|
| `BACKEND_URL` | Server only | Spring base URL; highest priority; not shipped to the browser bundle. |
| `NEXT_PUBLIC_API_URL` | Server and client | If it is `http(s)://`, it is treated as the Java URL. If it is a path (e.g. `/api`), it sets the client BFF prefix. |
| `NEXT_PUBLIC_BACKEND_URL` | Server and client | Public Java URL when `BACKEND_URL` / `NEXT_PUBLIC_API_URL` are not set as an absolute Java URL. |
| `NEXT_PUBLIC_APP_URL` | Server | Next app origin (e.g. `http://localhost:3001`) for absolute `fetch` to `/api/proxy/*` during SSR. |

Resolution logic lives in `lib/config-simple.ts` (`resolveJavaApiBaseUrl`, `resolveNextClientApiBase`). Production startup checks HTTPS and disallows localhost for the Java base URL.

### NPM scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server (port 3001, host `0.0.0.0`). |
| `pnpm build` | Production build. |
| `pnpm start` | Next production server. |
| `pnpm run env:init` | Creates `.env.local` from `.env.example` if missing. |
| `pnpm run env:validate` | Ensures `.env.local` or `.env` exists. |
| `pnpm run check-backend` | Helper script to verify backend URL in env files. |
| `pnpm run clean:next` | Deletes `.next` build artifacts. |

### Architecture

1. **Browser**: requests to `{NEXT_PUBLIC_APP_API_BASE or /api}/proxy/...` (BFF).
2. **Route Handlers** (`app/api/proxy/**`): read `config.api.backendUrl`, call Spring `/api/v1/...`, handle errors and timeouts.
3. **Spring Boot**: JSON payloads (often `snake_case`); TypeScript types in `lib/api.ts` follow that shape.

Authentication: `lib/auth.tsx` exposes a minimal context (no signed-in user). Do not assume OAuth or `/api/auth` routes exist without verifying `app/api`.

### Repository layout

- `app/` — App Router pages, layouts, `app/api` Route Handlers.
- `components/` — UI (Radix, Tailwind, forms, lists).
- `hooks/` — Data hooks (e.g. SWR, questions).
- `lib/api.ts` — HTTP client, domain types, `apiService`, `getQuestions`, `createQuestion`, `serverGetQuestions`.
- `lib/config-simple.ts` — URL and timeout configuration.
- `middleware/` — error utilities used by the deployment you configure.

### Build and security

- Do not commit `.env`, `.env.local`, or secrets; only `.env.example` is meant to be tracked.
- Set a strong `JWT_SECRET` in production; sample values are for local use only.
- Production Java endpoints should use HTTPS and be reachable from the Next runtime.

### License

`package.json` marks the package as `private` and does not declare a SPDX license. Add an explicit license file if you open the repository for redistribution.
