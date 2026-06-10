# Plano — ServiçoJá: "Tinder de Trabalho"

> ✅ **STATUS (10/06/2026): Fases 1, 2 e 3 implementadas e testadas de ponta a ponta.**
> Resta a Fase 4 (pós-MVP: login por WhatsApp, WebSocket, push, Postgres, deploy).

> App web (mobile-first, instalável como PWA) que conecta **quem contrata** e **quem trabalha**,
> com matching por swipe e chat direto entre as partes.

---

## 1. Conceito em uma frase

**Quem contrata posta o trabalho. Quem trabalha desliza pelos trabalhos do seu segmento
e dá ❤️ (tenho interesse) ou ✖️ (não quero). Quem contratou vê a lista de interessados
e abre um chat com quem quiser, direto no app.**

### Papéis (nomes simples, sem jargão)

| Papel técnico (código atual) | Nome no app |
|---|---|
| Solicitante | **"Quero contratar"** → Contratante |
| Prestador | **"Quero trabalhar"** → Trabalhador |

---

## 2. O que JÁ EXISTE no projeto (e será aproveitado)

O backend NestJS + Prisma já implementa ~70% da mecânica:

| Funcionalidade | Onde está | Status |
|---|---|---|
| Cadastro/login com JWT | `backend/src/auth` | ✅ pronto |
| Postar trabalho com fotos/categoria/bairro | `POST /api/servicos` | ✅ pronto |
| Feed filtrado por segmento (categorias do trabalhador) | `GET /api/feed` | ✅ pronto |
| Like (aceitar) / Dislike (recusar) sem re-exibição | `POST /api/feed/:id/aceitar\|recusar` | ✅ pronto |
| Contratante vê interessados e aprova um | `POST /api/servicos/:id/aprovar` | ✅ pronto |
| Notificações in-app | `backend/src/notificacoes` | ✅ pronto |
| Swipe com gesto (arrastar cartão) | `frontend/src/pages/prestador/PrestHome.jsx` | ✅ pronto |

**O que NÃO existe ainda:**

1. **Chat** entre contratante e interessado (hoje o "contato" é só liberar o WhatsApp)
2. **App real** — hoje o frontend é uma *demo* com os 2 apps lado a lado na mesma tela (`App.jsx`)
3. **UX para público simples** — linguagem, tamanho de botões, onboarding
4. Roteamento por URL (hoje não usa o react-router de verdade)

---

## 3. Fluxos principais

### Fluxo do CONTRATANTE
```
Abrir app → "Quero contratar"
  → Postar trabalho (3 passos: O quê? → Onde? → Foto [opcional])
  → Aguardar... (recebe notificação: "3 pessoas querem seu trabalho!")
  → Ver lista de interessados (foto, nome, nº de trabalhos feitos, avaliação)
  → Tocar num interessado → ver perfil → [💬 Conversar]
  → Chat → combinar → [✅ Fechar com este trabalhador]
  → Trabalho feito → [Concluir] → avaliar (⭐)
```

### Fluxo do TRABALHADOR
```
Abrir app → "Quero trabalhar"
  → Escolher segmentos (Elétrica, Pintura, Limpeza...) e bairros — 1 única vez
  → Tela principal = pilha de cartões de trabalho do seu segmento
  → Cartão mostra: foto grande, título, bairro, "há 2h"
  → Deslizar ⬅️ (✖️ não quero)  ou  ➡️ (❤️ tenho interesse)
  → Deu ❤️? → "Pronto! Se o contratante gostar de você, ele chama no chat."
  → Notificação: "Maria quer conversar!" → Chat
  → Fechou? Recebe confirmação → faz o trabalho → é avaliado
```

### Regras do match
- ❤️ do trabalhador **não abre chat sozinho** — só sinaliza interesse (evita spam no contratante).
- O **contratante decide** com quem conversar (pode conversar com vários ao mesmo tempo).
- Chat fecha quando o trabalho é concluído ou cancelado (histórico fica visível).

---

## 4. Mudanças no modelo de dados (Prisma)

O modelo atual (`Usuario`, `Servico`, `AcaoServico`, `Notificacao`) permanece. Adicionar:

```prisma
model Conversa {
  id           String   @id @default(uuid())
  servicoId    String
  contratanteId String
  trabalhadorId String
  status       String   @default("ABERTA") // ABERTA | FECHADA
  criadoEm     DateTime @default(now())
  mensagens    Mensagem[]

  @@unique([servicoId, trabalhadorId]) // 1 conversa por interessado por trabalho
}

model Mensagem {
  id         String   @id @default(uuid())
  conversaId String
  autorId    String
  texto      String
  lida       Boolean  @default(false)
  criadoEm   DateTime @default(now())

  conversa Conversa @relation(fields: [conversaId], references: [id])
  @@index([conversaId, criadoEm])
}

// Adicionar em Usuario (avaliação):
//   notaMedia     Float  @default(0)
//   totalAvaliacoes Int  @default(0)

model Avaliacao {
  id          String  @id @default(uuid())
  servicoId   String  @unique
  avaliadorId String
  avaliadoId  String
  nota        Int     // 1..5
  comentario  String?
  criadoEm    DateTime @default(now())
}
```

### Chat: tecnologia
- **Fase 1 — polling** (buscar mensagens novas a cada 3s quando o chat está aberto).
  Simples, zero dependência nova, funciona em qualquer rede ruim. Suficiente para MVP.
- **Fase 2 — WebSocket** (`@nestjs/websockets` + socket.io) quando houver volume.

Novos endpoints:
```
POST /api/conversas                     (contratante abre chat com interessado)
GET  /api/conversas                     (minhas conversas, com última msg + não lidas)
GET  /api/conversas/:id/mensagens       (?after=timestamp para polling)
POST /api/conversas/:id/mensagens       (enviar)
POST /api/servicos/:id/avaliar          (nota 1-5 ao concluir)
```

---

## 5. UX para público simples — princípios obrigatórios

O público-alvo inclui pessoas com pouca familiaridade digital. Cada tela segue estas regras:

1. **Uma ação principal por tela.** Botão grande (mín. 56px de altura), cor cheia, texto direto: "Postar trabalho", "Tenho interesse", "Conversar".
2. **Linguagem de gente, não de sistema.** Nunca "solicitação criada com sucesso" → sim "Pronto! Seu trabalho está no ar ✅". Nada de "feed", "match", "dashboard".
3. **Ícone + texto sempre juntos.** Nunca ícone sozinho (público simples não decora ícones).
4. **Padrões que o público JÁ conhece:**
   - Chat = cara do **WhatsApp** (balões verdes/brancos, hora, ✓✓)
   - Swipe = cara do **Tinder/Instagram** (cartão com foto grande)
   - Confiança = **estrelas + nº de trabalhos feitos** (como iFood/Uber)
5. **Onboarding em 3 telas no máximo**, com desenho mostrando o gesto de deslizar na primeira vez.
6. **Cadastro mínimo:** nome, WhatsApp (vira login via código SMS no futuro; por ora email/senha), cidade. Resto se preenche depois.
7. **Postar trabalho em 3 passos** com barra de progresso ("Passo 1 de 3"), categorias com ícones grandes em grade (🔌 Elétrica, 🎨 Pintura, 🧹 Limpeza...).
8. **Feedback imediato e festivo:** deu like → cartão voa com ❤️; recebeu interessado → confete discreto + "João quer fazer seu trabalho!".
9. **Tipografia ≥ 16px no corpo, 20px+ em títulos.** Alto contraste. Funciona com fonte do sistema ampliada.
10. **Estados vazios que ensinam:** "Nenhum trabalho por aqui ainda. Volte mais tarde ou aumente seus bairros 👇".

---

## 6. Reestruturação do frontend (de demo → app real)

Hoje: `App.jsx` renderiza dois "celulares" lado a lado (modo demonstração).

Novo:
```
/                  → Tela de boas-vindas: "Quero contratar" | "Quero trabalhar"
/entrar            → Login
/cadastro          → Cadastro (com escolha de papel)
/contratar/...     → app do contratante (Meus trabalhos, Postar, Conversas, Perfil)
/trabalhar/...     → app do trabalhador (Trabalhos [swipe], Meus interesses, Conversas, Perfil)
```

- **Mobile-first de verdade**: 100vw/100dvh, tabbar inferior com 4 abas (ícone + rótulo).
- **PWA**: manifest + service worker → instalável na tela inicial do Android ("Adicionar à tela inicial"), essencial para o público-alvo que não baixa app de loja.
- Reaproveitar: `SwipeStack` (gesto pronto), `Tabbar`, `UI.jsx`, `ToastContext`, `api.js`.
- O modo "demo lado a lado" pode sobreviver numa rota `/demo` para apresentações.

### Identidade visual
- Paleta quente e confiável (ex.: laranja/âmbar para ação + verde para confirmação — remete a trabalho/energia, diferencia do azul corporativo genérico).
- Cartões com foto grande e cantos arredondados; sombras suaves; animações curtas (200ms).
- Nome das telas pelo benefício: aba do swipe chama **"Trabalhos"**, não "Feed".

---

## 7. Roadmap por fases

### Fase 1 — App real + papéis renomeados (≈ base de tudo)
- [ ] Reestruturar frontend: rotas reais, tela de escolha de papel, login/cadastro mobile-first
- [ ] Tabbar 4 abas para cada papel; telas existentes adaptadas (swipe, postar, interessados)
- [ ] Postar trabalho em 3 passos com categorias em grade de ícones
- [ ] Onboarding de 3 telas no primeiro acesso
- **Critério de pronto:** uma pessoa abre no celular, se cadastra, posta/da like sem ajuda.

### Fase 2 — Chat (o coração do match)
- [ ] Migração Prisma: `Conversa` + `Mensagem`
- [ ] Módulo `conversas` no NestJS (endpoints acima) com polling
- [ ] Tela de lista de conversas (estilo WhatsApp: foto, nome, última msg, badge de não lidas)
- [ ] Tela de chat (balões, hora, enviar com Enter/botão)
- [ ] Botão "Conversar" na lista de interessados; "✅ Fechar com este trabalhador" dentro do chat
- **Critério de pronto:** contratante posta → trabalhador dá ❤️ → contratante abre chat → combinam → fecha → conclui.

### Fase 3 — Confiança e polimento
- [ ] Avaliação ⭐ 1–5 ao concluir (dos dois lados) + média no perfil
- [ ] PWA (manifest, ícone, service worker)
- [ ] Estados vazios ilustrados, micro-animações, som/vibração no like (opcional)
- [ ] Selo "Verificado" usando o `statusVerificacao` que já existe no schema

### Fase 4 — Crescimento (pós-MVP, não agora)
- Login por código no WhatsApp/SMS (remove a barreira da senha)
- WebSocket no chat + push notifications
- PostgreSQL (o schema já está preparado, é trocar o provider)
- Geolocalização real (raio de km em vez de lista de bairros)

---

## 8. Decisões assumidas (me corrija se discordar)

1. **Web/PWA primeiro, não app de loja** — a pasta `mobile/` (Expo) fica para depois; PWA atinge o público mais rápido e sem fricção de instalação.
2. **Chat por polling no MVP** — simplicidade > tempo real perfeito; WebSocket na Fase 4.
3. **O like do trabalhador não abre chat automaticamente** — o contratante escolhe quem chamar (protege os dois lados).
4. **Email/senha por enquanto**, login por WhatsApp depois.
5. **Manter SQLite no desenvolvimento** — migra para Postgres só no deploy.
```
