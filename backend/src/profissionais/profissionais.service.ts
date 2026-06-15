import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventosService } from '../eventos/eventos.service';

@Injectable()
export class ProfissionaisService {
  constructor(private prisma: PrismaService, private eventos: EventosService) {}

  // distância em km entre dois pontos (haversine)
  private _distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const rad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private _perfil(u: any, distanciaKm: number | null = null) {
    return {
      id: u.id,
      nome: u.nome,
      foto: u.foto,
      cidade: u.cidade,
      descricao: u.descricao,
      categorias: u.categorias ? u.categorias.split(',') : [],
      bairros: u.bairros ? u.bairros.split(',') : [],
      notaMedia: u.notaMedia,
      totalAvaliacoes: u.totalAvaliacoes,
      servicosConcluidos: u.servicosConcluidos,
      distanciaKm,
    };
  }

  // Lista profissionais de uma área para o contratante navegar (swipe)
  async listar(contratanteId: string, categoria?: string, lat?: number, lng?: number, raioKm?: number) {
    // Já curtidos/pulados por este contratante — não reaparecem
    const jaVistos = await this.prisma.interesseProfissional.findMany({
      where: { contratanteId },
      select: { trabalhadorId: true },
    });
    const bloqueados = jaVistos.map((v) => v.trabalhadorId);

    const profs = await this.prisma.usuario.findMany({
      where: {
        tipo: 'prestador',
        ativo: true,
        statusVerificacao: 'APROVADO',
        id: { notIn: bloqueados.length ? bloqueados : ['_'] },
        ...(categoria ? { categorias: { contains: categoria } } : {}),
      },
      orderBy: [{ notaMedia: 'desc' }, { servicosConcluidos: 'desc' }],
      take: 60,
    });

    // contains é "amplo" no SQLite (substring) — garante o match exato da categoria
    let lista = categoria
      ? profs.filter((p) => (p.categorias ? p.categorias.split(',') : []).includes(categoria))
      : profs;

    const temPos = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);

    let perfis = lista.map((p) => {
      const dist = temPos && p.lat != null && p.lng != null
        ? Math.round(this._distanciaKm(lat!, lng!, p.lat, p.lng) * 10) / 10
        : null;
      return this._perfil(p, dist);
    });

    if (temPos) {
      if (raioKm && raioKm > 0) {
        perfis = perfis.filter((p) => p.distanciaKm === null || p.distanciaKm <= raioKm);
      }
      perfis.sort((a, b) => {
        if (a.distanciaKm === null) return 1;
        if (b.distanciaKm === null) return -1;
        return a.distanciaKm - b.distanciaKm;
      });
    }

    return perfis;
  }

  // Contratante curte um profissional → registra interesse, cria conversa direta e avisa
  async curtir(contratanteId: string, trabalhadorId: string) {
    if (contratanteId === trabalhadorId) throw new BadRequestException('Ação inválida');
    const prof = await this.prisma.usuario.findUnique({ where: { id: trabalhadorId } });
    if (!prof || prof.tipo !== 'prestador') throw new NotFoundException('Profissional não encontrado');

    const contratante = await this.prisma.usuario.findUnique({ where: { id: contratanteId } });

    await this.prisma.interesseProfissional.upsert({
      where: { contratanteId_trabalhadorId: { contratanteId, trabalhadorId } },
      create: { contratanteId, trabalhadorId, status: 'ATIVO' },
      update: { status: 'ATIVO' },
    });

    // Conversa direta (sem trabalho). Reaproveita se já existir entre os dois.
    let conversa = await this.prisma.conversa.findFirst({
      where: { contratanteId, trabalhadorId, servicoId: null },
    });
    if (!conversa) {
      conversa = await this.prisma.conversa.create({
        data: {
          contratanteId,
          trabalhadorId,
          servicoId: null,
          assunto: 'Interesse no seu perfil',
          status: 'ABERTA',
        },
      });
    } else if (conversa.status !== 'ABERTA') {
      conversa = await this.prisma.conversa.update({
        where: { id: conversa.id },
        data: { status: 'ABERTA' },
      });
    }

    await this.prisma.notificacao.create({
      data: {
        usuarioId: trabalhadorId,
        tipo: 'CHAT',
        titulo: `💼 ${contratante?.nome?.split(' ')[0] || 'Um cliente'} se interessou por você!`,
        mensagem: 'Um contratante gostou do seu perfil. Abra a conversa e combine um trabalho.',
      },
    });

    this.eventos.track('CONVERSA');
    return { ok: true, conversaId: conversa.id };
  }

  // Contratante pula um profissional (não reaparece)
  async pular(contratanteId: string, trabalhadorId: string) {
    if (contratanteId === trabalhadorId) return { ok: true };
    await this.prisma.interesseProfissional.upsert({
      where: { contratanteId_trabalhadorId: { contratanteId, trabalhadorId } },
      create: { contratanteId, trabalhadorId, status: 'PULOU' },
      update: {}, // se já curtiu, mantém
    });
    return { ok: true };
  }
}
