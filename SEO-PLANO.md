# Plano de SEO — trampo.blog (ServiçoJá)

> Objetivo: ranquear no Google para buscas de **serviços locais** ("eletricista perto de mim",
> "quanto custa pintar apartamento", "encanador em [cidade]") e virar a porta de entrada
> de quem procura ou oferece serviço — **sem depender de anúncio pago**.

## 1. Diagnóstico honesto

- **Domínio novo** (trampo.blog) = autoridade zero. Google leva semanas/meses pra confiar.
- **Concorrentes fortes** (GetNinjas, Habitíssimo, Cronoshare) dominam o topo com milhares de
  páginas serviço×cidade e muita autoridade. Não dá pra vencer no volume — dá pra vencer no
  **conteúdo melhor, mais útil e mais rápido**, e no **long-tail** (buscas específicas).
- **Nossa vantagem:** páginas server-rendered (HTML puro pro Google, sem depender de JS),
  site rápido, dados estruturados (Article/FAQ/Service), e um produto real por trás.

## 2. Os 3 motores de tráfego orgânico

### 🅰️ Blog informacional (já no ar)
Captura quem pesquisa dúvida ("quanto cobrar diarista", "como contratar pintor").
6 artigos publicados. **Meta: 1 artigo novo a cada 2–3 dias** (já temos o agendador).

### 🅱️ Páginas serviço × cidade (o grande motor — construído agora)
Captura a busca local de alta intenção: "eletricista em São Paulo", "pintor em Guarulhos".
Cada página tem **conteúdo único**: faixa de preço local, bairros atendidos, serviços mais
pedidos, FAQ da cidade. **Começa com 5 cidades × 10 categorias = 50 páginas** (dentro do
limite de qualidade) e escala pra novas cidades conforme as primeiras forem indexadas.

### 🅲️ Home + marca
A home ranqueia pra "ServiçoJá" e termos genéricos. SEO técnico já reforçado (title, OG, canonical).

## 3. Arquitetura de URLs

```
/                                  → home (marca + valor)
/servicos                          → índice de todas as páginas locais
/servicos/eletricista-em-sao-paulo → serviço × cidade (50 páginas, conteúdo único)
/blog                              → índice do blog
/blog/como-contratar-um-pintor     → artigos (long-tail informacional)
/sitemap.xml  /robots.txt          → descoberta
```

**Links internos (decisivo pro Google entender o site):**
- Home → /servicos e /blog (menu + rodapé)
- Cada página local → 4 categorias da mesma cidade + a mesma categoria em 3 outras cidades + 1 artigo do blog
- Cada artigo do blog → página local relacionada
- /servicos (índice) → todas as 50 páginas

## 4. SEO técnico (já feito + manter)

- ✅ HTTPS (Let's Encrypt) · ✅ server-rendered · ✅ mobile-first · ✅ PWA
- ✅ `<title>`, meta description, canonical, Open Graph em todas as páginas
- ✅ Dados estruturados: Article + FAQPage (blog), Service + LocalBusiness + Breadcrumb + FAQ (local)
- ✅ sitemap.xml com todas as URLs + robots.txt apontando o sitemap
- ⏳ **Google Search Console**: domínio verificado → **enviar sitemap** (acelera indexação)
- 🎯 Core Web Vitals: site é leve; manter imagens otimizadas e sem JS pesado nas páginas de SEO

## 5. E-E-A-T (sinais de confiança que o Google valoriza)

- Conteúdo escrito com utilidade real (preços, dicas), não enrolação
- Página /servicos e artigos linkados entre si (autoridade temática)
- Avaliações reais dentro do app reforçam confiança (e podem virar conteúdo depois)
- Próximo passo: página "Sobre" + dados de contato (telefone/e-mail) = sinal local forte

## 6. Calendário (cadência realista)

| Quando | Ação |
|---|---|
| **Semana 1** (agora) | 50 páginas serviço×cidade no ar + sitemap atualizado + enviar no Search Console |
| Semana 1–2 | Pedir indexação das 10 páginas principais no Search Console |
| Semana 2–4 | +10 artigos no blog (agendador, 1 a cada 2 dias); ampliar keywords |
| Mês 2 | Se as 50 páginas indexaram bem → +5 cidades (mais 50 páginas) |
| Mês 2–3 | Página "Sobre", FAQ geral, primeiros backlinks (diretórios locais, redes sociais) |
| Mês 3–6 | Escalar cidades/categorias conforme tráfego; conteúdo de autoridade |

## 7. Metas realistas (sem prometer milagre)

| Métrica | Hoje | 1 mês | 3 meses | 6 meses |
|---|---|---|---|---|
| Páginas indexadas | ~8 | ~60 | ~120 | ~250 |
| Cliques orgânicos/mês | 0 | dezenas | centenas | 1–3 mil |
| Palavras no top 10 | 0 | poucas (long-tail) | dezenas | centenas |

> ⚠️ **Realismo:** SEO local de domínio novo dá resultado em **2–6 meses**, crescendo aos poucos.
> Não há atalho pago que substitua. O que acelera: **consistência** (conteúdo novo sempre),
> **links internos** e **backlinks** (outros sites citando o trampo.blog).

## 8. Regras de qualidade (pra NÃO ser penalizado)

- ❌ Nada de páginas iguais trocando só a cidade (Google penaliza "doorway pages")
- ✅ Cada página local tem preço, bairros e FAQ **diferentes** por cidade
- ✅ Começar com 50 páginas boas, não 500 rasas. Escalar só o que indexar bem
- ✅ Conteúdo pensado pra **ajudar a pessoa**, não pra enganar o robô
