import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

// Cidades padrão da varredura automática (grandes centros). O admin pode passar outras.
const CIDADES_PADRAO = ['São Paulo', 'Guarulhos', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba'];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Nossas categorias → termo de busca no empregos.com.br
const TERMO_BUSCA: Record<string, string> = {
  'Encanamento e hidráulica': 'encanador',
  'Elétrica': 'eletricista',
  'Pintura': 'pintor',
  'Reparos em eletrodomésticos': 'tecnico-de-eletrodomesticos',
  'Pedreiro e reformas pequenas': 'pedreiro',
  'Marcenaria e montagem de móveis': 'marceneiro',
  'Limpeza pesada': 'faxineira',
  'Jardinagem': 'jardineiro',
  'Chaveiro': 'chaveiro',
  'Ar-condicionado e refrigeração': 'tecnico-de-refrigeracao',
};

function slugify(s: string) {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizaNumero(bruto: string): string | null {
  const dig = bruto.replace(/\D/g, '');
  const num = dig.length > 11 && dig.startsWith('55') ? dig.slice(2) : dig;
  // celular válido: 11 dígitos com 9 após o DDD (evita CNPJ/IDs/datas)
  if (num.length === 11 && num[2] === '9') return num;
  if (num.length === 10) return num; // fixo (alguns anúncios usam)
  return null;
}

// Extrai um WhatsApp brasileiro de um texto. Prioriza números perto de
// "whats/zap/contato/tel" (alta confiança); links wa.me são certeza.
function extrairWhatsapp(texto: string): string | null {
  if (!texto) return null;

  // 1) Links diretos — certeza absoluta
  const link = texto.match(/wa\.me\/(\d{10,13})|whatsapp\.com\/send\?phone=(\d{10,13})/i);
  if (link) {
    const n = normalizaNumero(link[0]);
    if (n) return n;
  }

  // 2) Número logo após uma palavra-chave de contato (alta confiança)
  const ancorado = texto.match(
    /(whats?app?|whats|zap|contato|telefone|tel|fone|cel(?:ular)?)[\s:.\-]{0,12}(\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/i,
  );
  if (ancorado) {
    const n = normalizaNumero(ancorado[0].replace(/^[a-zà-ú]+/i, ''));
    if (n) return n;
  }

  // 3) Celular bem formatado (XX) 9XXXX-XXXX — só com o 9 de celular, baixo risco
  const formatado = texto.match(/\(?\d{2}\)?\s?9\d{4}[-\s]\d{4}/);
  if (formatado) {
    const n = normalizaNumero(formatado[0]);
    if (n) return n;
  }

  return null;
}

// === Fontes plugáveis de vagas ===
// Cada fonte sabe montar a URL de busca e ler o HTML (lista + detalhe).
// Adicionar uma fonte nova = só escrever mais um objeto destes.
type Fonte = {
  id: string;
  nome: string;
  termos: Record<string, string>;                                  // categoria → termo de busca
  listaUrl: (termo: string, citySlug: string) => string;
  extrair: (html: string, citySlug: string) => { url: string; slug: string }[];
  parse: (html: string, slug: string, termo: string, cidade: string) => { titulo: string; descricao: string };
};

const FONTE_EMPREGOS: Fonte = {
  id: 'empregos',
  nome: 'empregos.com.br',
  termos: TERMO_BUSCA,
  listaUrl: (termo) => `https://www.empregos.com.br/vagas/${termo}`,
  extrair: (html, citySlug) => {
    const todos = Array.from(html.matchAll(/\/vaga\/(\d+)\/([a-z0-9-]+)/g)).map((m) => ({
      url: `https://www.empregos.com.br/vaga/${m[1]}/${m[2]}`, slug: m[2],
    }));
    const unicos = Array.from(new Map(todos.map((v) => [v.url, v])).values());
    // a cidade vem no slug: ...-em-{cidade}-{uf}
    return unicos.filter((v) => v.slug.includes(`-em-${citySlug}-`) || v.slug.includes(`-${citySlug}-`));
  },
  parse: (html, slug, termo, cidade) => {
    const titulo = (html.match(/<title>([^<]+)<\/title>/i)?.[1] || slug.replace(/-/g, ' '))
      .replace(/\s*[-|].*$/, '').trim().slice(0, 60);
    const descricao = (html.match(/<meta name="description" content="([^"]+)"/i)?.[1] || `Vaga de ${termo} em ${cidade}.`).slice(0, 500);
    return { titulo, descricao };
  },
};

const FONTE_INFOJOBS: Fonte = {
  id: 'infojobs',
  nome: 'infojobs.com.br',
  termos: {
    'Encanamento e hidráulica': 'encanador',
    'Elétrica': 'eletricista',
    'Pintura': 'pintor',
    'Reparos em eletrodomésticos': 'eletrodomesticos',
    'Pedreiro e reformas pequenas': 'pedreiro',
    'Marcenaria e montagem de móveis': 'marceneiro',
    'Limpeza pesada': 'faxineiro',
    'Jardinagem': 'jardineiro',
    'Chaveiro': 'chaveiro',
    'Ar-condicionado e refrigeração': 'refrigeracao',
  },
  listaUrl: (termo) => `https://www.infojobs.com.br/empregos.aspx?palabra=${termo}`,
  extrair: (html, citySlug) => {
    // links de vaga: /vaga-de-{slug-com-cidade}__{id}.aspx
    const todos = Array.from(html.matchAll(/\/vaga-de-([a-z0-9-]+)__(\d+)\.aspx/g)).map((m) => ({
      url: `https://www.infojobs.com.br/vaga-de-${m[1]}__${m[2]}.aspx`, slug: m[1],
    }));
    const unicos = Array.from(new Map(todos.map((v) => [v.url, v])).values());
    // a cidade/região vem no slug: ...-em-{cidade}
    const naCidade = unicos.filter((v) => v.slug.includes(`-em-${citySlug}`) || v.slug.includes(`-${citySlug}-`));
    return naCidade.length ? naCidade : [];
  },
  parse: (html, slug, termo, cidade) => {
    const raw = (html.match(/<title>\s*([^<]+?)\s*<\/title>/i)?.[1] || '');
    // "Vaga de emprego de Pintor Predial em São Paulo - SP" → "Pintor Predial"
    const semPrefixo = raw.replace(/^vaga de (emprego de\s+)?/i, '');
    const titulo = (semPrefixo.split(/\s+em\s+/i)[0] || slug.replace(/-/g, ' ')).trim().slice(0, 60);
    const descricao = (html.match(/<meta name="description" content="([^"]+)"/i)?.[1] || `Vaga de ${termo} em ${cidade}.`).slice(0, 500);
    return { titulo, descricao };
  },
};

const FONTES: Fonte[] = [FONTE_EMPREGOS, FONTE_INFOJOBS];

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly log = new Logger('AdminService');
  private varrendo = false;                 // trava: uma varredura por vez
  private ultimaVarredura: any = null;       // resumo da última varredura
  private ultimoDiaCron = '';                // controle do cron diário

  constructor(private prisma: PrismaService) {}

  // Cron diário (~4h da manhã): varre as cidades padrão + as que já têm trabalho importado
  onModuleInit() {
    const tick = async () => {
      const agora = new Date();
      const dia = agora.toISOString().slice(0, 10);
      if (agora.getHours() === 4 && this.ultimoDiaCron !== dia && !this.varrendo) {
        this.ultimoDiaCron = dia;
        const extras = await this.prisma.servico.findMany({
          where: { origem: 'EXTERNO' }, select: { cidade: true }, distinct: ['cidade'], take: 20,
        });
        const cidades = Array.from(new Set([...CIDADES_PADRAO, ...extras.map((e) => e.cidade)]));
        this.log.log(`🌙 Varredura automática diária em ${cidades.length} cidades`);
        this.varrerAsync(cidades);
      }
    };
    setInterval(tick, 30 * 60000); // checa a cada 30 min
  }

  private async fetchTexto(url: string, ms = 12000): Promise<string | null> {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ms);
      const res = await fetch(url, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    }
  }

  // Usuário "sistema" dono dos trabalhos externos (Servico exige um solicitante)
  private async getSistemaId(): Promise<string> {
    let u = await this.prisma.usuario.findUnique({ where: { whatsapp: '0000000000000' } });
    if (!u) {
      const bcrypt = await import('bcryptjs');
      u = await this.prisma.usuario.create({
        data: {
          tipo: 'solicitante',
          nome: 'ServiçoJá',
          whatsapp: '0000000000000',
          senhaHash: await bcrypt.hash(Math.random().toString(36), 10),
          cidade: 'Brasil',
          ativo: false, // não loga, não aparece como gente
        },
      });
    }
    return u.id;
  }

  private async geocode(bairro: string, cidade: string) {
    const tentativas = [bairro ? `${bairro}, ${cidade}, Brasil` : '', `${cidade}, Brasil`].filter(Boolean);
    for (const q of tentativas) {
      const txt = await this.fetchTexto(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        5000,
      );
      try {
        const data = JSON.parse(txt || '[]');
        if (data?.[0]?.lat) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      } catch {}
    }
    return null;
  }

  private fotoCategoria(categoria: string) {
    const fotos: Record<string, string> = {
      'Encanamento e hidráulica': 'https://images.unsplash.com/photo-1542013936693-884638332954?w=800&q=80',
      'Elétrica': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
      'Pintura': 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&q=80',
      'Reparos em eletrodomésticos': 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&q=80',
      'Pedreiro e reformas pequenas': 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80',
      'Marcenaria e montagem de móveis': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      'Limpeza pesada': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
      'Jardinagem': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      'Chaveiro': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&q=80',
      'Ar-condicionado e refrigeração': 'https://images.unsplash.com/photo-1585104555336-4d4d10a59850?w=800&q=80',
    };
    return fotos[categoria] || fotos['Pintura'];
  }

  // === Importação automática (roda TODAS as fontes e junta o resultado) ===
  async importar(opts: {
    categoria: string;
    cidade: string;
    bairro?: string;
    somenteWhatsapp?: boolean;
    limite?: number;
  }) {
    if (!FONTES.some((f) => f.termos[opts.categoria])) {
      throw new BadRequestException('A categoria "Outros" não tem busca automática. Use "Postar manual".');
    }
    const resultados: any[] = [];
    for (const fonte of FONTES) {
      try { resultados.push(await this.importarDeFonte(fonte, opts)); } catch {}
    }
    const agg = resultados.reduce(
      (a, r) => ({
        encontradas: a.encontradas + (r.encontradas || 0),
        naCidade: a.naCidade + (r.naCidade || 0),
        comWhatsapp: a.comWhatsapp + (r.comWhatsapp || 0),
        publicadas: a.publicadas + (r.publicadas || 0),
        itens: a.itens.concat(r.itens || []),
      }),
      { encontradas: 0, naCidade: 0, comWhatsapp: 0, publicadas: 0, itens: [] as any[] },
    );
    return {
      fonte: FONTES.map((f) => f.nome).join(' + '),
      termo: TERMO_BUSCA[opts.categoria] || FONTE_INFOJOBS.termos[opts.categoria] || '',
      cidade: opts.cidade,
      ...agg,
      somenteWhatsapp: opts.somenteWhatsapp !== false,
      porFonte: resultados.map((r) => ({ fonte: r.fonte, publicadas: r.publicadas, comWhatsapp: r.comWhatsapp, erro: r.erro })),
    };
  }

  // Importa de UMA fonte. somenteWhatsapp=false publica também anúncios sem
  // WhatsApp (vira "Contato pelo anúncio" → abre a URL original), com teto
  // maxSemWhatsapp pra não inundar o feed de uma categoria/cidade.
  private async importarDeFonte(
    fonte: Fonte,
    opts: { categoria: string; cidade: string; bairro?: string; somenteWhatsapp?: boolean; limite?: number; maxSemWhatsapp?: number },
  ) {
    const termo = fonte.termos[opts.categoria];
    if (!termo) return { fonte: fonte.nome, encontradas: 0, naCidade: 0, comWhatsapp: 0, publicadas: 0, itens: [] };
    const somenteWhatsapp = opts.somenteWhatsapp !== false; // padrão: true
    const limite = Math.min(opts.limite || 12, 20);
    const maxSemWhatsapp = opts.maxSemWhatsapp ?? 4;
    const citySlug = slugify(opts.cidade);

    const lista = await this.fetchTexto(fonte.listaUrl(termo, citySlug));
    if (!lista) {
      return { fonte: fonte.nome, encontradas: 0, naCidade: 0, comWhatsapp: 0, publicadas: 0, itens: [], erro: `Não foi possível acessar ${fonte.nome} agora.` };
    }

    const vagas = fonte.extrair(lista, citySlug);
    const encontradas = vagas.length;
    const alvo = vagas.slice(0, limite + maxSemWhatsapp + 8);

    const sistemaId = await this.getSistemaId();
    const coords = await this.geocode(opts.bairro || '', opts.cidade);

    let comWhatsapp = 0, publicadas = 0, semWhatsPub = 0;
    const itens: any[] = [];

    for (const vaga of alvo) {
      if (publicadas >= limite) break;
      const existe = await this.prisma.servico.findFirst({ where: { fonteUrl: vaga.url } });
      if (existe) continue;

      const html = await this.fetchTexto(vaga.url);
      if (!html) continue;

      const { titulo, descricao } = fonte.parse(html, vaga.slug, termo, opts.cidade);
      const whatsapp = extrairWhatsapp(html);
      if (whatsapp) comWhatsapp++;

      // Sem WhatsApp: só publica se o filtro estiver desligado e dentro do teto
      if (!whatsapp) {
        if (somenteWhatsapp) continue;
        if (semWhatsPub >= maxSemWhatsapp) continue;
      }

      await this.prisma.servico.create({
        data: {
          solicitanteId: sistemaId,
          titulo: titulo || `${termo} em ${opts.cidade}`,
          descricao,
          categoria: opts.categoria,
          fotos: this.fotoCategoria(opts.categoria),
          cidade: opts.cidade,
          bairro: opts.bairro || opts.cidade,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          estado: 'ABERTO',
          origem: 'EXTERNO',
          contatoExterno: whatsapp,
          contatoTipo: whatsapp ? 'WHATSAPP' : 'LINK',
          fonteNome: fonte.nome,
          fonteUrl: vaga.url,
        },
      });
      publicadas++;
      if (!whatsapp) semWhatsPub++;
      itens.push({ titulo, contato: whatsapp ? 'WhatsApp' : 'Link', fonte: fonte.nome, url: vaga.url });
      await sleep(250); // educado com a fonte
    }

    return { fonte: fonte.nome, termo, cidade: opts.cidade, encontradas, naCidade: encontradas, comWhatsapp, publicadas, somenteWhatsapp, itens };
  }

  // === Varredura geral: todas as categorias × várias cidades ===
  // Dispara em background e responde na hora (não trava o navegador).
  iniciarVarredura(cidades?: string[]) {
    if (this.varrendo) {
      return { ok: false, jaRodando: true, mensagem: 'Já existe uma varredura em andamento.' };
    }
    const lista = (cidades && cidades.length ? cidades : CIDADES_PADRAO)
      .map((c) => c.trim()).filter(Boolean).slice(0, 12);
    this.varrerAsync(lista);
    return {
      ok: true,
      iniciada: true,
      cidades: lista,
      categorias: Object.keys(TERMO_BUSCA).length,
      fontes: FONTES.map((f) => f.nome),
      mensagem: `Varrendo ${Object.keys(TERMO_BUSCA).length} categorias em ${lista.length} cidade(s), em ${FONTES.length} fontes (${FONTES.map((f) => f.nome).join(', ')}). Os trabalhos vão aparecendo na aba "Publicados".`,
    };
  }

  async varrerAsync(cidades: string[]) {
    this.varrendo = true;
    const inicio = Date.now();
    let publicadas = 0, varridas = 0, comWhatsapp = 0;
    try {
      for (const cidade of cidades) {
        for (const categoria of Object.keys(TERMO_BUSCA)) {
          for (const fonte of FONTES) {
            try {
              // Varredura busca volume: inclui anúncios sem WhatsApp (até 3 por
              // categoria/cidade/fonte) — o resto que tiver WhatsApp entra todo.
              const r = await this.importarDeFonte(fonte, { categoria, cidade, somenteWhatsapp: false, limite: 6, maxSemWhatsapp: 3 });
              publicadas += r.publicadas || 0;
              comWhatsapp += r.comWhatsapp || 0;
              varridas += r.encontradas || 0;
            } catch {}
            await sleep(800); // educado com as fontes
          }
        }
      }
    } finally {
      this.varrendo = false;
      this.ultimaVarredura = {
        em: new Date().toISOString(),
        cidades,
        fontes: FONTES.map((f) => f.nome),
        varridas, comWhatsapp, comLink: publicadas - comWhatsapp, publicadas,
        duracaoSeg: Math.round((Date.now() - inicio) / 1000),
      };
      this.log.log(`✅ Varredura concluída: ${publicadas} publicadas (${comWhatsapp} c/ WhatsApp, ${publicadas - comWhatsapp} c/ link) em ${cidades.length} cidades × ${FONTES.length} fontes`);
    }
  }

  statusVarredura() {
    return { varrendo: this.varrendo, ultima: this.ultimaVarredura };
  }

  // === Post manual de trabalho externo (caminho garantido, com WhatsApp) ===
  async postarExterno(opts: {
    categoria: string;
    cidade: string;
    bairro?: string;
    descricao: string;
    whatsapp: string;
  }) {
    const whatsapp = (opts.whatsapp || '').replace(/\D/g, '');
    if (whatsapp.length < 10 || whatsapp.length > 13) {
      throw new BadRequestException('WhatsApp inválido. Use DDD + número.');
    }
    if (!TERMO_BUSCA[opts.categoria]) throw new BadRequestException('Categoria inválida');

    const sistemaId = await this.getSistemaId();
    const coords = await this.geocode(opts.bairro || '', opts.cidade);
    const bairro = opts.bairro?.trim() || opts.cidade;

    const s = await this.prisma.servico.create({
      data: {
        solicitanteId: sistemaId,
        titulo: `${opts.categoria.split(' ')[0]} em ${bairro}`.slice(0, 60),
        descricao: opts.descricao.trim().slice(0, 500),
        categoria: opts.categoria,
        fotos: this.fotoCategoria(opts.categoria),
        cidade: opts.cidade.trim(),
        bairro,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        estado: 'ABERTO',
        origem: 'EXTERNO',
        contatoExterno: whatsapp,
        contatoTipo: 'WHATSAPP',
        fonteNome: 'Admin',
        fonteUrl: null,
      },
    });
    return { ok: true, id: s.id };
  }

  // === Lista e remoção dos externos ===
  async listarExternos() {
    const rows = await this.prisma.servico.findMany({
      where: { origem: 'EXTERNO' },
      orderBy: { criadoEm: 'desc' },
      take: 200,
    });
    // Conta interesses (likes) por trabalho
    const ids = rows.map((r) => r.id);
    const likes = await this.prisma.acaoServico.groupBy({
      by: ['servicoId'],
      where: { servicoId: { in: ids }, acao: 'ACEITOU' },
      _count: { id: true },
    });
    const likeMap: Record<string, number> = {};
    likes.forEach((l) => { likeMap[l.servicoId] = l._count.id; });

    return rows.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      categoria: r.categoria,
      cidade: r.cidade,
      bairro: r.bairro,
      estado: r.estado,
      contatoTipo: r.contatoTipo,
      temWhatsapp: !!r.contatoExterno,
      fonteNome: r.fonteNome,
      fonteUrl: r.fonteUrl,
      interesses: likeMap[r.id] || 0,
      criadoEm: r.criadoEm,
    }));
  }

  async removerExterno(id: string) {
    const s = await this.prisma.servico.findUnique({ where: { id } });
    if (!s || s.origem !== 'EXTERNO') throw new BadRequestException('Trabalho externo não encontrado');
    await this.prisma.acaoServico.deleteMany({ where: { servicoId: id } });
    await this.prisma.notificacao.deleteMany({ where: { servicoId: id } });
    await this.prisma.servico.delete({ where: { id } });
    return { ok: true };
  }

  async resumo() {
    const externos = await this.prisma.servico.count({ where: { origem: 'EXTERNO' } });
    const comWhats = await this.prisma.servico.count({ where: { origem: 'EXTERNO', contatoTipo: 'WHATSAPP' } });
    const usuarios = await this.prisma.usuario.count({ where: { ativo: true } });
    const proprios = await this.prisma.servico.count({ where: { origem: 'PROPRIO' } });
    return { externos, comWhats, comLink: externos - comWhats, usuarios, proprios };
  }
}
