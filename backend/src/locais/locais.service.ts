import { Injectable } from '@nestjs/common';
import { CATEGORIAS, CIDADES, CategoriaSeed, CidadeSeed, faixaPreco, slugLocal } from './locais.data';

const SITE = process.env.SITE_URL || 'https://servicoja.digital';

function esc(s: string) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

@Injectable()
export class LocaisService {
  private find(slug: string): { cat: CategoriaSeed; cid: CidadeSeed } | null {
    for (const cat of CATEGORIAS) {
      for (const cid of CIDADES) {
        if (slugLocal(cat, cid) === slug) return { cat, cid };
      }
    }
    return null;
  }

  // Lista de todas as URLs (para o sitemap)
  urls(): string[] {
    const out = [`${SITE}/servico`];
    for (const cat of CATEGORIAS) for (const cid of CIDADES) out.push(`${SITE}/servico/${slugLocal(cat, cid)}`);
    return out;
  }

  // ---- Índice /servico ----
  paginaIndex(): string {
    const grupos = CATEGORIAS.map((cat) => {
      const links = CIDADES.map((cid) =>
        `<a class="loc-link" href="/servico/${slugLocal(cat, cid)}">${esc(cat.termo === 'diarista' ? 'Diarista' : cap(cat.termo))} em ${esc(cid.nome)}</a>`,
      ).join('');
      return `<section class="loc-group"><h2>${cat.emoji} ${esc(cat.nome)}</h2><div class="loc-links">${links}</div></section>`;
    }).join('');

    return layout({
      title: 'Serviços por cidade — ServiçoJá',
      description: 'Encontre eletricista, encanador, pintor, diarista e mais em São Paulo, Rio, BH, Guarulhos e Curitiba. Profissionais perto de você, com avaliação e chat direto.',
      canonical: `${SITE}/servico`,
      jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Serviços por cidade', url: `${SITE}/servico` }],
      body: `
        <header class="hero">
          <a href="/" class="logo">Serviço<span>Já.</span></a>
          <h1>Serviços perto de você</h1>
          <p class="dek">Escolha o serviço e a cidade para encontrar profissionais avaliados, com chat direto.</p>
        </header>
        <main class="loc-wrap">${grupos}</main>`,
    });
  }

  // ---- Página serviço × cidade ----
  paginaServico(slug: string): string | null {
    const m = this.find(slug);
    if (!m) return null;
    const { cat, cid } = m;
    const termoCap = cat.termo === 'diarista' ? 'Diarista' : cap(cat.termo);
    const titulo = `${termoCap} em ${cid.nome}: encontre profissionais perto de você`;
    const desc = `Precisa de ${cat.termo} em ${cid.nome}? Veja a faixa de preço, bairros atendidos e contrate um profissional avaliado, com chat direto. Grátis no ServiçoJá.`;
    const preco = faixaPreco(cat, cid);
    const bairros = cid.bairros;

    // outras categorias na mesma cidade (links internos)
    const outrasCats = CATEGORIAS.filter((c) => c.slug !== cat.slug).slice(0, 4)
      .map((c) => `<a href="/servico/${slugLocal(c, cid)}">${c.emoji} ${esc(cap(c.termo))} em ${esc(cid.nome)}</a>`).join('');
    // a mesma categoria em outras cidades (links internos)
    const outrasCidades = CIDADES.filter((c) => c.slug !== cid.slug).slice(0, 4)
      .map((c) => `<a href="/servico/${slugLocal(cat, c)}">${esc(termoCap)} em ${esc(c.nome)}</a>`).join('');

    const faq = [
      { q: `Quanto custa um ${cat.termo} em ${cid.nome}?`, a: `Em ${cid.nome}, o serviço de ${cat.termo} costuma ficar em torno de ${preco}, variando conforme o tamanho e a complexidade. No ServiçoJá você recebe propostas de vários profissionais e compara antes de fechar.` },
      { q: `Como encontrar um ${cat.termo} de confiança perto de mim?`, a: `Veja a nota e os trabalhos já feitos de cada profissional, prefira quem atende seu bairro e converse pelo chat antes de combinar. No app você vê tudo isso e a distância de cada um.` },
      { q: `O ServiçoJá cobra alguma taxa?`, a: `Não. Publicar o pedido e conversar com os profissionais é gratuito, tanto para quem contrata quanto para quem trabalha.` },
    ];

    const jsonld: any[] = [
      { '@context': 'https://schema.org', '@type': 'Service', serviceType: cat.nome,
        areaServed: { '@type': 'City', name: cid.nome }, provider: { '@type': 'Organization', name: 'ServiçoJá', url: SITE },
        name: `${termoCap} em ${cid.nome}`, description: desc },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Serviços', item: `${SITE}/servico` },
        { '@type': 'ListItem', position: 3, name: `${termoCap} em ${cid.nome}`, item: `${SITE}/servico/${slug}` },
      ] },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ];

    const body = `
      <nav class="crumbs"><a href="/">Início</a> › <a href="/servico">Serviços</a> › <span>${esc(termoCap)} em ${esc(cid.nome)}</span></nav>
      <article class="post">
        <span class="tag">${cat.emoji} ${esc(cat.nome)} · ${esc(cid.nome)}/${cid.uf}</span>
        <h1>${esc(titulo)}</h1>
        <div class="content">
          <p class="lead">Procurando <strong>${esc(cat.termo)} em ${esc(cid.nome)}</strong>? ${esc(cid.nome)} é ${esc(cid.contexto)}. No ServiçoJá você descreve o que precisa, recebe interessados perto de você — com nota e preço — e combina tudo pelo chat. De graça.</p>

          <div class="cta"><strong>Precisa agora?</strong><p>Poste seu pedido de ${esc(cat.termo)} em ${esc(cid.nome)} e receba propostas de profissionais avaliados.</p><a href="/cadastro?papel=contratante" class="cta-btn">Quero contratar →</a></div>

          <h2>Quanto custa ${esc(cat.termo)} em ${esc(cid.nome)}?</h2>
          <p>A mão de obra de ${esc(cat.termo)} em ${esc(cid.nome)} costuma ficar em <strong>${esc(preco)}</strong>, dependendo do tamanho do serviço e do material. O melhor jeito de não pagar caro é comparar mais de um orçamento — e é exatamente o que o ServiçoJá facilita.</p>

          <h2>Serviços de ${esc(cat.termo)} mais pedidos</h2>
          <ul>${cat.servicos.map((s) => `<li>${esc(cap(s))}</li>`).join('')}</ul>

          <h2>Bairros de ${esc(cid.nome)} atendidos</h2>
          <p>Há profissionais de ${esc(cat.termo)} atendendo em vários bairros de ${esc(cid.nome)}, como ${bairros.map((b) => `<strong>${esc(b)}</strong>`).join(', ')} e região. Como o app mostra a distância de cada um, você acha quem está pertinho.</p>

          <h2>Dica para contratar bem</h2>
          <p>💡 ${esc(cat.dica)}</p>

          <h2>Como funciona</h2>
          <ul>
            <li>Você conta o que precisa (leva 1 minuto)</li>
            <li>Profissionais de ${esc(cat.termo)} em ${esc(cid.nome)} demonstram interesse</li>
            <li>Você vê nota, trabalhos feitos e distância — e escolhe</li>
            <li>Combina tudo pelo chat, sem compromisso</li>
          </ul>

          <h2>Perguntas frequentes</h2>
          ${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}

          <div class="cta cta2"><strong>É ${esc(cat.termo)} em ${esc(cid.nome)}?</strong><p>Receba pedidos do seu bairro, sem prospecção. Grátis.</p><a href="/cadastro?papel=trabalhador" class="cta-btn">Quero trabalhar →</a></div>
        </div>
      </article>

      <aside class="related">
        <h3>Outros serviços em ${esc(cid.nome)}</h3>
        <div class="rel-links">${outrasCats}</div>
        <h3>${esc(termoCap)} em outras cidades</h3>
        <div class="rel-links">${outrasCidades}</div>
        <a href="/servico" class="back">← Ver todos os serviços</a>
      </aside>`;

    return layout({ title: `${titulo} | ServiçoJá`, description: desc, canonical: `${SITE}/servico/${slug}`, jsonld, body });
  }
}

/* Layout HTML server-rendered, mesma identidade do blog */
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
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${o.canonical}">
<meta property="og:site_name" content="ServiçoJá">
<meta property="og:image" content="${SITE}/icon-512.png">
<meta name="theme-color" content="#0E0E10">
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
.hero,.post,.crumbs,.related,.loc-wrap{max-width:760px;margin-inline:auto;padding-inline:22px}
.logo{font-family:'Bricolage Grotesque';font-weight:800;font-size:22px;text-decoration:none;display:inline-block;margin-top:30px}
.logo span{color:var(--lime)}
.hero{padding-top:6px;padding-bottom:18px;border-bottom:1px solid var(--bd)}
.hero h1{font-family:'Bricolage Grotesque';font-size:clamp(30px,6vw,44px);font-weight:800;letter-spacing:-.02em;margin:22px 0 8px}
.dek{color:var(--dim);font-size:18px;margin:0 0 6px}
.crumbs{padding-top:26px;color:var(--mut);font-size:13px}
.crumbs a{color:var(--dim);text-decoration:none}
.crumbs a:hover{color:var(--tx)}
.post{padding-top:18px}
.tag{display:inline-block;font-size:12px;font-weight:700;color:var(--lime);background:rgba(214,255,58,.12);padding:5px 11px;border-radius:999px}
.post h1{font-family:'Bricolage Grotesque';font-size:clamp(26px,5vw,40px);font-weight:800;letter-spacing:-.02em;line-height:1.12;margin:14px 0 18px}
.content h2{font-family:'Bricolage Grotesque';font-size:24px;font-weight:700;margin:34px 0 10px;letter-spacing:-.01em}
.content h3{font-family:'Bricolage Grotesque';font-size:18px;font-weight:700;margin:24px 0 6px}
.content p{color:var(--dim);margin:0 0 16px}
.content .lead{font-size:20px;color:var(--tx)}
.content ul{color:var(--dim);padding-left:4px;list-style:none}
.content li{position:relative;padding-left:26px;margin-bottom:9px}
.content li::before{content:'✓';position:absolute;left:0;color:var(--lime);font-weight:800}
.content strong{color:var(--tx)}
.cta{background:linear-gradient(135deg,rgba(214,255,58,.1),rgba(96,165,250,.07));border:1px solid var(--bd);border-radius:20px;padding:24px;margin:30px 0}
.cta2{background:linear-gradient(135deg,rgba(96,165,250,.1),transparent)}
.cta strong{font-family:'Bricolage Grotesque';font-size:20px;display:block;margin-bottom:6px}
.cta p{color:var(--dim);margin:0 0 16px}
.cta-btn{display:inline-block;background:var(--lime);color:#0E0E10;font-weight:800;text-decoration:none;padding:13px 22px;border-radius:14px}
.related{padding:30px 22px 70px}
.related h3{font-family:'Bricolage Grotesque';font-size:16px;margin:22px 0 10px}
.rel-links{display:flex;flex-wrap:wrap;gap:9px}
.rel-links a{background:var(--soft);border:1px solid var(--bd);border-radius:10px;padding:9px 13px;font-size:14px;text-decoration:none;color:var(--dim)}
.rel-links a:hover{border-color:var(--mut);color:var(--tx)}
.back{display:inline-block;margin-top:22px;color:var(--lime);font-weight:700;text-decoration:none}
.loc-wrap{padding-top:26px;padding-bottom:60px}
.loc-group{margin-bottom:26px}
.loc-group h2{font-family:'Bricolage Grotesque';font-size:19px;margin:0 0 12px}
.loc-links{display:flex;flex-wrap:wrap;gap:9px}
.loc-link{background:var(--soft);border:1px solid var(--bd);border-radius:10px;padding:9px 13px;font-size:14px;text-decoration:none;color:var(--dim)}
.loc-link:hover{border-color:var(--lime);color:var(--tx)}
footer{border-top:1px solid var(--bd);padding:30px 22px;text-align:center;color:var(--mut);font-size:14px}
footer a{color:var(--dim);text-decoration:none}
</style>
</head>
<body>
${o.body}
<footer>Serviço<span style="color:var(--lime)">Já.</span> · <a href="/">Início</a> · <a href="/servico">Serviços</a> · <a href="/blog">Blog</a> · Feito no Brasil 🇧🇷</footer>
</body>
</html>`;
}
