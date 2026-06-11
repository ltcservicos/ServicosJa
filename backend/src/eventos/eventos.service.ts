import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventosService {
  constructor(private prisma: PrismaService) {}

  // Registra um evento sem nunca quebrar o fluxo principal
  async track(tipo: string, ref?: string) {
    try {
      await this.prisma.evento.create({ data: { tipo, ref: ref || null } });
    } catch {}
  }

  // Resumo para o painel admin: totais + série dos últimos 14 dias
  async resumo() {
    const grupos = await this.prisma.evento.groupBy({
      by: ['tipo'],
      _count: { id: true },
    });
    const totais: Record<string, number> = {};
    grupos.forEach((g) => { totais[g.tipo] = g._count.id; });

    // Série diária (14 dias) — agrupada em memória
    const desde = new Date(Date.now() - 13 * 86400000);
    desde.setHours(0, 0, 0, 0);
    const eventos = await this.prisma.evento.findMany({
      where: { criadoEm: { gte: desde } },
      select: { tipo: true, criadoEm: true },
    });

    const dias: { dia: string; visitas: number; cadastros: number; trabalhos: number; interesses: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(desde.getTime() + i * 86400000);
      dias.push({ dia: d.toISOString().slice(5, 10), visitas: 0, cadastros: 0, trabalhos: 0, interesses: 0 });
    }
    const idxDe = (dt: Date) => Math.floor((new Date(dt).setHours(0, 0, 0, 0) - desde.getTime()) / 86400000);
    eventos.forEach((e) => {
      const i = idxDe(e.criadoEm);
      if (i < 0 || i > 13) return;
      if (e.tipo === 'VISITA') dias[i].visitas++;
      else if (e.tipo.startsWith('CADASTRO')) dias[i].cadastros++;
      else if (e.tipo === 'TRABALHO_POSTADO') dias[i].trabalhos++;
      else if (e.tipo === 'INTERESSE') dias[i].interesses++;
    });

    const visitas = totais['VISITA'] || 0;
    const cadastros = (totais['CADASTRO_CONTRATANTE'] || 0) + (totais['CADASTRO_TRABALHADOR'] || 0);
    return {
      cards: {
        visitas,
        cadastros,
        contratantes: totais['CADASTRO_CONTRATANTE'] || 0,
        trabalhadores: totais['CADASTRO_TRABALHADOR'] || 0,
        trabalhos: totais['TRABALHO_POSTADO'] || 0,
        interesses: totais['INTERESSE'] || 0,
        conversas: totais['CONVERSA'] || 0,
        importados: totais['IMPORTADO'] || 0,
        conversao: visitas > 0 ? Math.round((cadastros / visitas) * 1000) / 10 : 0,
      },
      serie: dias,
    };
  }
}
