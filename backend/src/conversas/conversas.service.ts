import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbrirConversaDto, EnviarMensagemDto } from './conversas.dto';

@Injectable()
export class ConversasService {
  constructor(private prisma: PrismaService) {}

  private _serializeParte(u: any) {
    if (!u) return null;
    return {
      id: u.id,
      nome: u.nome,
      foto: u.foto,
      cidade: u.cidade,
      notaMedia: u.notaMedia,
      totalAvaliacoes: u.totalAvaliacoes,
      servicosConcluidos: u.servicosConcluidos,
    };
  }

  private async _getParticipante(conversaId: string, userId: string) {
    const c = await this.prisma.conversa.findUnique({
      where: { id: conversaId },
      include: { servico: true },
    });
    if (!c) throw new NotFoundException('Conversa não encontrada');
    if (c.contratanteId !== userId && c.trabalhadorId !== userId) {
      throw new ForbiddenException('Você não participa desta conversa');
    }
    return c;
  }

  // Contratante abre (ou reabre) o chat com um interessado
  async abrir(userId: string, dto: AbrirConversaDto) {
    const servico = await this.prisma.servico.findUnique({ where: { id: dto.servicoId } });
    if (!servico) throw new NotFoundException('Trabalho não encontrado');
    if (servico.solicitanteId !== userId) {
      throw new ForbiddenException('Apenas quem publicou o trabalho pode abrir a conversa');
    }
    if (!['ABERTO', 'APROVADO'].includes(servico.estado)) {
      throw new BadRequestException('Este trabalho não está mais ativo');
    }

    // O trabalhador precisa ter demonstrado interesse (like)
    const interesse = await this.prisma.acaoServico.findFirst({
      where: { servicoId: dto.servicoId, prestadorId: dto.trabalhadorId, acao: 'ACEITOU' },
    });
    if (!interesse) {
      throw new BadRequestException('Este trabalhador não demonstrou interesse neste trabalho');
    }

    const existente = await this.prisma.conversa.findUnique({
      where: { servicoId_trabalhadorId: { servicoId: dto.servicoId, trabalhadorId: dto.trabalhadorId } },
    });
    if (existente) return this.getOne(existente.id, userId);

    const conversa = await this.prisma.conversa.create({
      data: {
        servicoId: dto.servicoId,
        contratanteId: userId,
        trabalhadorId: dto.trabalhadorId,
      },
    });

    const contratante = await this.prisma.usuario.findUnique({ where: { id: userId } });
    await this.prisma.notificacao.create({
      data: {
        usuarioId: dto.trabalhadorId,
        tipo: 'CHAT',
        titulo: `💬 ${contratante?.nome?.split(' ')[0] || 'O contratante'} quer conversar!`,
        mensagem: `Sobre o trabalho "${servico.titulo}". Responda no app.`,
        servicoId: dto.servicoId,
      },
    });

    return this.getOne(conversa.id, userId);
  }

  // Detalhe de uma conversa
  async getOne(conversaId: string, userId: string) {
    const c = await this._getParticipante(conversaId, userId);
    const full = await this.prisma.conversa.findUnique({
      where: { id: conversaId },
      include: { contratante: true, trabalhador: true, servico: true },
    });
    const souContratante = full!.contratanteId === userId;
    return {
      id: full!.id,
      status: full!.status,
      criadoEm: full!.criadoEm,
      souContratante,
      outraParte: this._serializeParte(souContratante ? full!.trabalhador : full!.contratante),
      servico: {
        id: full!.servico.id,
        titulo: full!.servico.titulo,
        estado: full!.servico.estado,
        fotos: full!.servico.fotos.split('|||').filter(Boolean),
        prestadorAceitoId: full!.servico.prestadorAceitoId,
      },
    };
  }

  // Lista de conversas do usuário (qualquer papel)
  async listar(userId: string) {
    const conversas = await this.prisma.conversa.findMany({
      where: { OR: [{ contratanteId: userId }, { trabalhadorId: userId }] },
      include: {
        contratante: true,
        trabalhador: true,
        servico: true,
        mensagens: { orderBy: { criadoEm: 'desc' }, take: 1 },
      },
      orderBy: { atualizadoEm: 'desc' },
    });

    const naoLidas = await this.prisma.mensagem.groupBy({
      by: ['conversaId'],
      where: {
        conversa: { OR: [{ contratanteId: userId }, { trabalhadorId: userId }] },
        autorId: { not: userId },
        lida: false,
      },
      _count: { id: true },
    });
    const unreadMap: Record<string, number> = {};
    naoLidas.forEach((n) => { unreadMap[n.conversaId] = n._count.id; });

    return conversas.map((c) => {
      const souContratante = c.contratanteId === userId;
      const ultima = c.mensagens[0] || null;
      return {
        id: c.id,
        status: c.status,
        souContratante,
        outraParte: this._serializeParte(souContratante ? c.trabalhador : c.contratante),
        servico: {
          id: c.servico.id,
          titulo: c.servico.titulo,
          estado: c.servico.estado,
          fotos: c.servico.fotos.split('|||').filter(Boolean),
        },
        ultimaMensagem: ultima
          ? { texto: ultima.texto, criadoEm: ultima.criadoEm, minha: ultima.autorId === userId }
          : null,
        naoLidas: unreadMap[c.id] || 0,
        atualizadoEm: c.atualizadoEm,
      };
    });
  }

  // Total de mensagens não lidas (badge da aba)
  async unreadCount(userId: string) {
    const count = await this.prisma.mensagem.count({
      where: {
        conversa: { OR: [{ contratanteId: userId }, { trabalhadorId: userId }] },
        autorId: { not: userId },
        lida: false,
      },
    });
    return { count };
  }

  // Mensagens (com ?after= para polling); marca as recebidas como lidas
  async mensagens(conversaId: string, userId: string, after?: string) {
    await this._getParticipante(conversaId, userId);

    const where: any = { conversaId };
    if (after) {
      const d = new Date(after);
      if (!isNaN(d.getTime())) where.criadoEm = { gt: d };
    }

    const msgs = await this.prisma.mensagem.findMany({
      where,
      orderBy: { criadoEm: 'asc' },
    });

    await this.prisma.mensagem.updateMany({
      where: { conversaId, autorId: { not: userId }, lida: false },
      data: { lida: true },
    });

    return msgs.map((m) => ({
      id: m.id,
      texto: m.texto,
      minha: m.autorId === userId,
      lida: m.lida,
      criadoEm: m.criadoEm,
    }));
  }

  async enviar(conversaId: string, userId: string, dto: EnviarMensagemDto) {
    const c = await this._getParticipante(conversaId, userId);
    if (c.status !== 'ABERTA') {
      throw new BadRequestException('Esta conversa foi encerrada');
    }
    const texto = dto.texto.trim();
    if (!texto) throw new BadRequestException('Mensagem vazia');

    const [msg] = await this.prisma.$transaction([
      this.prisma.mensagem.create({
        data: { conversaId, autorId: userId, texto },
      }),
      // "toca" a conversa para subir na lista
      this.prisma.conversa.update({
        where: { id: conversaId },
        data: { status: c.status },
      }),
    ]);

    return { id: msg.id, texto: msg.texto, minha: true, lida: false, criadoEm: msg.criadoEm };
  }
}
