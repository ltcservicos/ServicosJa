import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

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

@Injectable()
export class AdminService {
  private readonly log = new Logger('AdminService');

  constructor(private prisma: PrismaService) {}

  private async fetchTexto(url: string, ms = 12000): Promise<string | null> {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ms);
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
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

  // === Importação automática do empregos.com.br ===
  async importarEmpregos(opts: {
    categoria: string;
    cidade: string;
    bairro?: string;
    somenteWhatsapp?: boolean;
    limite?: number;
  }) {
    const termo = TERMO_BUSCA[opts.categoria];
    if (!termo) throw new BadRequestException('Categoria sem mapeamento de busca');
    const somenteWhatsapp = opts.somenteWhatsapp !== false; // padrão: true
    const limite = Math.min(opts.limite || 12, 20);
    const citySlug = slugify(opts.cidade);

    const lista = await this.fetchTexto(`https://www.empregos.com.br/vagas/${termo}`);
    if (!lista) {
      return { fonte: 'empregos.com.br', encontradas: 0, naCidade: 0, comWhatsapp: 0, publicadas: 0, itens: [], erro: 'Não foi possível acessar o empregos.com.br agora.' };
    }

    // Links de vaga: /vaga/{id}/{slug-com-cidade}
    const todos = Array.from(lista.matchAll(/\/vaga\/(\d+)\/([a-z0-9-]+)/g)).map((m) => ({
      url: `https://www.empregos.com.br/vaga/${m[1]}/${m[2]}`,
      slug: m[2],
    }));
    const unicos = Array.from(new Map(todos.map((v) => [v.url, v])).values());
    const encontradas = unicos.length;

    // Filtra pela cidade (o slug termina com -em-{cidade}-{uf})
    const naCidade = unicos.filter((v) => v.slug.includes(`-em-${citySlug}-`) || v.slug.includes(`-${citySlug}-`));
    const alvo = (naCidade.length > 0 ? naCidade : []).slice(0, limite);

    const sistemaId = await this.getSistemaId();
    const coords = await this.geocode(opts.bairro || '', opts.cidade);

    let comWhatsapp = 0;
    let publicadas = 0;
    const itens: any[] = [];

    for (const vaga of alvo) {
      // Pula se já importado
      const existe = await this.prisma.servico.findFirst({ where: { fonteUrl: vaga.url } });
      if (existe) continue;

      const html = await this.fetchTexto(vaga.url);
      if (!html) continue;

      const titulo = (html.match(/<title>([^<]+)<\/title>/i)?.[1] || vaga.slug.replace(/-/g, ' '))
        .replace(/\s*[-|].*$/, '')
        .trim()
        .slice(0, 60);
      const descMatch = html.match(/<meta name="description" content="([^"]+)"/i);
      const descricao = (descMatch?.[1] || `Vaga de ${termo} em ${opts.cidade}.`).slice(0, 500);

      const whatsapp = extrairWhatsapp(html);
      if (whatsapp) comWhatsapp++;

      // Regra do admin: por padrão só publica quando tem WhatsApp do contratante
      if (somenteWhatsapp && !whatsapp) continue;

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
          fonteNome: 'empregos.com.br',
          fonteUrl: vaga.url,
        },
      });
      publicadas++;
      itens.push({ titulo, contato: whatsapp ? 'WhatsApp' : 'Link', url: vaga.url });
    }

    return {
      fonte: 'empregos.com.br',
      termo,
      cidade: opts.cidade,
      encontradas,
      naCidade: naCidade.length,
      comWhatsapp,
      publicadas,
      somenteWhatsapp,
      itens,
    };
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
