import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KEYWORDS, KeywordSeed } from './keywords';
import { CATEGORIAS as LOC_CATS, CIDADES as LOC_CIDADES, slugLocal } from '../locais/locais.data';

const SITE = process.env.SITE_URL || 'https://servicoja.digital';

function slugify(s: string) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
}
function esc(s: string) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

@Injectable()
export class BlogService implements OnModuleInit {
  private readonly log = new Logger('BlogService');
  private ultimoPostDia = ''; // controle do cron "1 post por dia"
  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    // (1) Cron simples: publica posts AGENDADOS cujo horário já chegou
    const tickAgendados = async () => {
      try {
        const r = await this.prisma.post.updateMany({
          where: { status: 'AGENDADO', publishAt: { lte: new Date() } },
          data: { status: 'PUBLICADO' },
        });
        if (r.count > 0) this.log.log(`📰 ${r.count} post(s) do blog publicado(s) automaticamente`);
      } catch {}
    };
    setInterval(tickAgendados, 60000);
    setTimeout(tickAgendados, 4000);

    // (2) Cron matinal: publica UM post novo por dia (~8h de Brasília = 11h UTC)
    const tickManha = async () => {
      const agora = new Date();
      const dia = agora.toISOString().slice(0, 10);
      if (agora.getUTCHours() === 11 && this.ultimoPostDia !== dia) {
        this.ultimoPostDia = dia;
        await this.publicarProximoPendente();
      }
    };
    setInterval(tickManha, 20 * 60000); // checa a cada 20 min
  }

  // Publica o próximo artigo ainda não gerado (na ordem da lista de keywords —
  // os SEO regionais de Guarulhos vêm primeiro). Roda 1x por dia pelo cron matinal.
  async publicarProximoPendente() {
    const existentes = await this.prisma.post.findMany({ select: { keyword: true } });
    const jaTem = new Set(existentes.map((p) => p.keyword));
    const proxima = KEYWORDS.find((k) => !jaTem.has(k.keyword));
    if (!proxima) { this.log.log('📰 Blog: nenhuma keyword pendente para publicar hoje'); return { ok: true, publicado: null }; }
    await this.gerar(proxima.keyword); // publishAt = agora → PUBLICADO
    this.log.log(`📰 Post do dia publicado: ${proxima.titulo}`);
    return { ok: true, publicado: proxima.titulo };
  }

  // ---- Geração do HTML do artigo a partir do seed da keyword ----
  private montarConteudo(seed: KeywordSeed): string {
    const partes: string[] = [];
    partes.push(`<p class="lead">${esc(seed.resumo)}</p>`);
    for (const s of seed.secoes) {
      partes.push(`<h2>${esc(s.h2)}</h2>`);
      for (const p of s.p) partes.push(`<p>${esc(p)}</p>`);
      if (s.lista?.length) {
        partes.push('<ul>' + s.lista.map((li) => `<li>${esc(li)}</li>`).join('') + '</ul>');
      }
    }
    // CTA para o app
    const ctaLabel = seed.intencao === 'trabalhar' ? 'Quero receber trabalhos' : 'Quero contratar agora';
    const ctaPapel = seed.intencao === 'trabalhar' ? 'trabalhador' : 'contratante';
    partes.push(
      `<div class="cta"><strong>Pronto para resolver?</strong><p>No ServiçoJá você encontra ${esc(seed.categoria.toLowerCase())} perto de você, com avaliações e chat direto. Grátis.</p><a href="/cadastro?papel=${ctaPapel}" class="cta-btn">${ctaLabel} →</a></div>`,
    );
    if (seed.faq?.length) {
      partes.push('<h2>Perguntas frequentes</h2>');
      for (const f of seed.faq) {
        partes.push(`<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`);
      }
    }
    return partes.join('\n');
  }

  // ---- Admin: lista de keywords com status (gerado ou não) ----
  async keywords() {
    const posts = await this.prisma.post.findMany({ select: { keyword: true, slug: true, status: true, publishAt: true } });
    const mapa = new Map(posts.map((p) => [p.keyword, p]));
    return KEYWORDS.map((k) => {
      const existente = mapa.get(k.keyword);
      return {
        keyword: k.keyword,
        titulo: k.titulo,
        categoria: k.categoria,
        intencao: k.intencao,
        gerado: !!existente,
        slug: existente?.slug || slugify(k.titulo),
        status: existente?.status || null,
        publishAt: existente?.publishAt || null,
      };
    });
  }

  // ---- Admin: gera (ou reusa) um post de uma keyword ----
  async gerar(keyword: string, publishAt?: string) {
    const seed = KEYWORDS.find((k) => k.keyword === keyword);
    if (!seed) throw new BadRequestException('Palavra-chave não encontrada');

    const slug = slugify(seed.titulo);
    const quando = publishAt ? new Date(publishAt) : new Date();
    const status = quando.getTime() > Date.now() + 60000 ? 'AGENDADO' : 'PUBLICADO';

    const post = await this.prisma.post.upsert({
      where: { slug },
      create: {
        slug,
        titulo: seed.titulo,
        resumo: seed.resumo,
        metaDescription: seed.resumo.slice(0, 158),
        keyword: seed.keyword,
        categoria: seed.categoria,
        conteudo: this.montarConteudo(seed),
        faq: JSON.stringify(seed.faq || []),
        status,
        publishAt: quando,
      },
      update: { status, publishAt: quando, conteudo: this.montarConteudo(seed) },
    });
    return { ok: true, slug: post.slug, status: post.status };
  }

  // ---- Admin: agenda um lote, 1 post por dia a partir de amanhã ----
  async agendarLote() {
    const existentes = await this.prisma.post.findMany({ select: { keyword: true } });
    const jaTem = new Set(existentes.map((p) => p.keyword));
    const pendentes = KEYWORDS.filter((k) => !jaTem.has(k.keyword));
    let dia = 1;
    const base = new Date();
    base.setHours(9, 0, 0, 0);
    for (const k of pendentes) {
      const quando = new Date(base.getTime() + dia * 86400000);
      await this.gerar(k.keyword, quando.toISOString());
      dia++;
    }
    return { ok: true, agendados: pendentes.length };
  }

  async listarAdmin() {
    const posts = await this.prisma.post.findMany({ orderBy: { publishAt: 'desc' } });
    return posts.map((p) => ({
      id: p.id, slug: p.slug, titulo: p.titulo, keyword: p.keyword, categoria: p.categoria,
      status: p.status, publishAt: p.publishAt, views: p.views,
    }));
  }

  async publicarAgora(id: string) {
    await this.prisma.post.update({ where: { id }, data: { status: 'PUBLICADO', publishAt: new Date() } });
    return { ok: true };
  }

  async remover(id: string) {
    await this.prisma.post.delete({ where: { id } });
    return { ok: true };
  }

  // ---- Público ----
  async publicados() {
    return this.prisma.post.findMany({
      where: { status: 'PUBLICADO', publishAt: { lte: new Date() } },
      orderBy: { publishAt: 'desc' },
      select: { slug: true, titulo: true, resumo: true, categoria: true, publishAt: true, keyword: true },
    });
  }

  async bySlug(slug: string) {
    const p = await this.prisma.post.findUnique({ where: { slug } });
    if (!p || p.status !== 'PUBLICADO' || p.publishAt > new Date()) return null;
    this.prisma.post.update({ where: { id: p.id }, data: { views: { increment: 1 } } }).catch(() => {});
    return p;
  }

  // ---- Páginas HTML (SEO server-rendered) ----
  async paginaIndex(): Promise<string> {
    const posts = await this.publicados();
    const cards = posts.map((p) => `
      <a class="card" href="/blog/${p.slug}">
        <span class="tag">${esc(p.categoria)}</span>
        <h2>${esc(p.titulo)}</h2>
        <p>${esc(p.resumo)}</p>
        <span class="more">Ler artigo →</span>
      </a>`).join('');
    const vazio = `<p class="empty">Em breve, novos artigos com dicas de serviços e trabalho. 🙂</p>`;

    const jsonld = {
      '@context': 'https://schema.org', '@type': 'Blog', name: 'Blog ServiçoJá',
      url: `${SITE}/blog`, description: 'Dicas para contratar serviços e para profissionais conseguirem mais trabalhos.',
    };
    return layout({
      title: 'Blog ServiçoJá — dicas de serviços e trabalho',
      description: 'Guias práticos para contratar pintor, eletricista, encanador, diarista e mais — e para profissionais conseguirem mais clientes.',
      canonical: `${SITE}/blog`,
      jsonld: [jsonld],
      body: `
        <header class="hero">
          <a href="/" class="logo">Serviço<span>Já.</span></a>
          <h1>Blog ServiçoJá</h1>
          <p class="dek">Dicas para contratar bem e para profissionais conseguirem mais trabalhos.</p>
        </header>
        <main class="grid">${posts.length ? cards : vazio}</main>`,
    });
  }

  async paginaPost(slug: string): Promise<string | null> {
    const p = await this.bySlug(slug);
    if (!p) return null;
    const faq: { q: string; a: string }[] = JSON.parse(p.faq || '[]');
    const dataISO = new Date(p.publishAt).toISOString();
    const dataBR = new Date(p.publishAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    const article = {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: p.titulo, description: p.metaDescription,
      datePublished: dataISO, dateModified: new Date(p.atualizadoEm).toISOString(),
      author: { '@type': 'Organization', name: 'ServiçoJá' },
      publisher: { '@type': 'Organization', name: 'ServiçoJá', logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png` } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${p.slug}` },
    };
    const breadcrumb = {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
        { '@type': 'ListItem', position: 3, name: p.titulo, item: `${SITE}/blog/${p.slug}` },
      ],
    };
    const jsonld: any[] = [article, breadcrumb];
    if (faq.length) {
      jsonld.push({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      });
    }

    return layout({
      title: `${p.titulo} | ServiçoJá`,
      description: p.metaDescription,
      canonical: `${SITE}/blog/${p.slug}`,
      jsonld,
      body: `
        <nav class="crumbs"><a href="/">Início</a> › <a href="/blog">Blog</a> › <span>${esc(p.categoria)}</span></nav>
        <article class="post">
          <span class="tag">${esc(p.categoria)}</span>
          <h1>${esc(p.titulo)}</h1>
          <div class="byline">Por <strong>ServiçoJá</strong> · ${dataBR} · ${Math.max(2, Math.round(p.conteudo.length / 900))} min de leitura</div>
          <div class="content">${p.conteudo}</div>
        </article>
        <aside class="related">
          <a href="/blog" class="back">← Ver todos os artigos</a>
        </aside>`,
    });
  }

  async sitemap(): Promise<string> {
    const posts = await this.publicados();
    // páginas serviço × cidade (geradas, sempre presentes)
    const locais: { loc: string; pri: string }[] = [{ loc: `${SITE}/servico`, pri: '0.8' }];
    for (const cat of LOC_CATS) for (const cid of LOC_CIDADES) {
      locais.push({ loc: `${SITE}/servico/${slugLocal(cat, cid)}`, pri: '0.7' });
    }
    const urls = [
      { loc: `${SITE}/`, pri: '1.0' },
      { loc: `${SITE}/blog`, pri: '0.8' },
      ...posts.map((p) => ({ loc: `${SITE}/blog/${p.slug}`, pri: '0.7', lastmod: new Date(p.publishAt).toISOString().slice(0, 10) })),
      ...locais,
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u: any) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.pri}</priority></url>`).join('\n') +
      `\n</urlset>`;
  }

  robots(): string {
    return `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`;
  }
}

/* Template HTML server-rendered, com a identidade do app e SEO completo */
function layout(o: { title: string; description: string; canonical: string; jsonld: any[]; body: string }): string {
  const ld = o.jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
<link rel="canonical" href="${o.canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${o.canonical}">
<meta property="og:site_name" content="ServiçoJá">
<meta property="og:image" content="${SITE}/icon-512.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#16161A">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
${ld}
<style>
:root{--bg:#0E0E10;--soft:#16161A;--surf:#1E1E24;--bd:#2E2E38;--tx:#F4F4F6;--dim:#B6B6C0;--mut:#6B6B78;--lime:#D6FF3A;--blue:#60A5FA}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tx);font-family:'DM Sans',system-ui,sans-serif;line-height:1.7;font-size:17px}
a{color:inherit}
.wrap,.hero,.grid,.post,.crumbs,.related{max-width:760px;margin-inline:auto;padding-inline:22px}
.logo{font-family:'Bricolage Grotesque';font-weight:800;font-size:22px;text-decoration:none;display:inline-block;margin-top:30px}
.logo span{color:var(--lime)}
.hero{padding-top:6px;padding-bottom:18px;border-bottom:1px solid var(--bd)}
.hero h1{font-family:'Bricolage Grotesque';font-size:clamp(30px,6vw,46px);font-weight:800;letter-spacing:-.02em;margin:22px 0 8px}
.dek{color:var(--dim);font-size:18px;margin:0 0 6px}
.grid{display:grid;gap:16px;padding-top:28px;padding-bottom:60px}
.card{display:block;background:var(--soft);border:1px solid var(--bd);border-radius:18px;padding:22px;text-decoration:none;transition:border-color .2s,transform .2s}
.card:hover{border-color:var(--mut);transform:translateY(-3px)}
.tag{display:inline-block;font-size:12px;font-weight:700;color:var(--lime);background:rgba(214,255,58,.12);padding:5px 11px;border-radius:999px}
.card h2{font-family:'Bricolage Grotesque';font-size:21px;font-weight:700;margin:14px 0 8px;line-height:1.2}
.card p{color:var(--dim);font-size:15px;margin:0 0 12px}
.more{color:var(--lime);font-weight:700;font-size:14px}
.empty{color:var(--mut);text-align:center;padding:50px 0}
.crumbs{padding-top:26px;color:var(--mut);font-size:13px}
.crumbs a{color:var(--dim);text-decoration:none}
.crumbs a:hover{color:var(--tx)}
.post{padding-top:18px}
.post h1{font-family:'Bricolage Grotesque';font-size:clamp(28px,5vw,42px);font-weight:800;letter-spacing:-.02em;line-height:1.1;margin:14px 0 10px}
.byline{color:var(--mut);font-size:14px;margin-bottom:30px;padding-bottom:22px;border-bottom:1px solid var(--bd)}
.content h2{font-family:'Bricolage Grotesque';font-size:26px;font-weight:700;margin:38px 0 12px;letter-spacing:-.01em}
.content h3{font-family:'Bricolage Grotesque';font-size:19px;font-weight:700;margin:26px 0 6px}
.content p{color:var(--dim);margin:0 0 16px}
.content .lead{font-size:20px;color:var(--tx)}
.content ul{color:var(--dim);padding-left:4px;list-style:none}
.content li{position:relative;padding-left:26px;margin-bottom:9px}
.content li::before{content:'✓';position:absolute;left:0;color:var(--lime);font-weight:800}
.cta{background:linear-gradient(135deg,rgba(214,255,58,.1),rgba(96,165,250,.07));border:1px solid var(--bd);border-radius:20px;padding:26px;margin:38px 0}
.cta strong{font-family:'Bricolage Grotesque';font-size:20px;display:block;margin-bottom:6px}
.cta p{color:var(--dim);margin:0 0 16px}
.cta-btn{display:inline-block;background:var(--lime);color:#0E0E10;font-weight:800;text-decoration:none;padding:13px 22px;border-radius:14px}
.related{padding-bottom:70px;padding-top:10px}
.back{color:var(--lime);font-weight:700;text-decoration:none}
footer{border-top:1px solid var(--bd);padding:30px 22px;text-align:center;color:var(--mut);font-size:14px}
footer a{color:var(--dim);text-decoration:none}
</style>
</head>
<body>
${o.body}
<footer>Serviço<span style="color:var(--lime)">Já.</span> · <a href="/">Página inicial</a> · <a href="/blog">Blog</a> · Feito no Brasil 🇧🇷</footer>
</body>
</html>`;
}
