# ServiçoJá

Marketplace de serviços com matching estilo Tinder e **chat integrado**.

**Como funciona:** quem contrata posta o trabalho → profissionais do ramo deslizam
e dão ❤️ (interesse) ou ✖️ → quem contratou vê os interessados (com nota ⭐ e nº de
trabalhos), abre **chat** com quem quiser, fecha negócio e avalia ao final.

Stack:
- **Backend:** NestJS + Prisma + JWT + SQLite (trocável por PostgreSQL)
- **Frontend:** React + Vite + TailwindCSS + React Router (PWA instalável)
- **Chat:** polling leve (3s) — pronto para evoluir para WebSocket
- **DB:** SQLite (arquivo local, zero setup)

## Como rodar

Você precisa do **Node.js 18+** instalado (https://nodejs.org).

### 1. Backend (terminal 1)

```bash
cd backend
npm install
npx prisma migrate dev
npm run seed
npm run start:dev
```

API sobe em `http://localhost:3000/api`.

### 2. Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

App abre em `http://localhost:5173`.

### 3. Testar

Abra duas janelas do navegador (uma normal e uma anônima) para simular os dois lados.
O seed já cria:

- 1 contratante: `maria@demo.com` / senha `demo`
- 2 trabalhadores: `joao@demo.com` (encanador/eletricista) e `carlos@demo.com` (pintor/marceneiro) / senha `demo`
- 2 trabalhos no ar (1 de encanamento para o João, 1 de pintura para o Carlos)

**Fluxo completo:** entre como João → dê ❤️ no trabalho → entre como Maria →
abra o trabalho → toque em "Conversar" → troquem mensagens → "Fechar negócio" →
"O trabalho foi feito" → avalie com ⭐.

## Estrutura

```
ServicosJa/
├── backend/              NestJS API
│   ├── prisma/           Schema (Usuario, Servico, AcaoServico, Conversa, Mensagem, Avaliacao)
│   └── src/
│       ├── auth/         Login/cadastro com JWT
│       ├── servicos/     Publicar, feed, like/dislike, escolher, concluir, avaliar
│       ├── conversas/    Chat (abrir, listar, mensagens com polling)
│       └── notificacoes/ Avisos in-app
└── frontend/             React + Vite (PWA)
    └── src/
        ├── pages/        Landing, Cadastro, contratante/, trabalhador/, chat/
        ├── shells/       Layout de cada papel (tabbar + onboarding)
        └── components/   UI, swipe, modal de avaliação
```

## Rotas do app

| Rota | O que é |
|---|---|
| `/` | Escolha de papel: "Quero contratar" ou "Quero trabalhar" |
| `/contratar` | App do contratante (Início, Postar, Conversas, Perfil) |
| `/trabalhar` | App do trabalhador (Trabalhos/swipe, Interesses, Conversas, Perfil) |

## Migrando para PostgreSQL

Em `backend/prisma/schema.prisma`, troque:
```prisma
datasource db {
  provider = "postgresql"   // era "sqlite"
  url      = env("DATABASE_URL")
}
```

E ajuste `backend/.env`:
```
DATABASE_URL="postgresql://user:pass@localhost:5432/servicoja"
```

Depois rode `npx prisma migrate dev`.

## Próximos passos para produção

Veja o plano completo em [`PLANO-APP.md`](./PLANO-APP.md). Resumo:
- Login por código no WhatsApp/SMS (tira a barreira da senha)
- WebSocket no chat + push notifications (Firebase)
- Upload de fotos para S3/Cloudinary (hoje: base64 no banco)
- Verificação real de profissionais (hoje: aprovação automática)
- Deploy: backend no Railway/Render, frontend no Vercel/Netlify
