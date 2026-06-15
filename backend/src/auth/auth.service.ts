import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { EventosService } from '../eventos/eventos.service';
import { LoginDto, SignupDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private eventos: EventosService,
  ) {}

  // Guarda só os dígitos do WhatsApp — vira a chave de login
  private _normalizaWpp(n: string) {
    return (n || '').replace(/\D/g, '');
  }

  // Geocodifica cidade (+ bairro) p/ ter a distância na busca de profissionais. Não bloqueia o cadastro.
  private async _geocode(cidade: string, bairro?: string): Promise<{ lat: number; lng: number } | null> {
    const tentativas = [bairro ? `${bairro}, ${cidade}, Brasil` : '', `${cidade}, Brasil`].filter(Boolean);
    for (const q of tentativas) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
          { headers: { 'User-Agent': 'ServicoJa/1.0' }, signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) continue;
        const data: any = await res.json();
        if (data?.[0]?.lat) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      } catch {}
    }
    return null;
  }

  async signup(dto: SignupDto) {
    const whatsapp = this._normalizaWpp(dto.whatsapp);
    if (whatsapp.length < 10) {
      throw new BadRequestException('WhatsApp inválido. Use o número com DDD.');
    }

    const jaTemWpp = await this.prisma.usuario.findUnique({ where: { whatsapp } });
    if (jaTemWpp) throw new BadRequestException('Este WhatsApp já tem conta. Toque em "Entrar".');

    if (dto.email) {
      const jaTemEmail = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
      if (jaTemEmail) throw new BadRequestException('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    // Prestador: geocodifica p/ aparecer com distância na busca de profissionais
    const coords = dto.tipo === 'prestador' ? await this._geocode(dto.cidade, dto.bairros?.[0]) : null;

    const user = await this.prisma.usuario.create({
      data: {
        tipo: dto.tipo,
        nome: dto.nome,
        email: dto.email || null,
        senhaHash,
        whatsapp,
        cidade: dto.cidade,
        cep: dto.cep,
        estado: dto.estado,
        rua: dto.rua,
        numero: dto.numero,
        complemento: dto.complemento,
        descricao: dto.descricao,
        foto: dto.foto || null,
        categorias: dto.categorias?.join(',') || null,
        bairros: dto.bairros?.join(',') || null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        // MVP: aprovação automática; trocar por fluxo de verificação real depois
        statusVerificacao: 'APROVADO',
      },
    });

    this.eventos.track(dto.tipo === 'prestador' ? 'CADASTRO_TRABALHADOR' : 'CADASTRO_CONTRATANTE', dto.cidade);

    return this._withToken(user);
  }

  async login(dto: LoginDto) {
    // Aceita WhatsApp (qualquer formatação, com ou sem o 55 do Brasil) ou e-mail
    const digits = this._normalizaWpp(dto.login);
    let user = null;
    if (digits.length >= 10) {
      const candidatos = [...new Set([
        digits,
        `55${digits}`,
        digits.startsWith('55') ? digits.slice(2) : '',
      ])].filter((c) => c.length >= 10);
      for (const c of candidatos) {
        user = await this.prisma.usuario.findUnique({ where: { whatsapp: c } });
        if (user) break;
      }
    } else {
      user = await this.prisma.usuario.findUnique({ where: { email: dto.login.trim() } });
    }
    if (!user) throw new UnauthorizedException('WhatsApp ou senha errados. Confira e tente de novo.');

    const ok = await bcrypt.compare(dto.senha, user.senhaHash);
    if (!ok) throw new UnauthorizedException('WhatsApp ou senha errados. Confira e tente de novo.');

    return this._withToken(user);
  }

  private _withToken(user: any) {
    const payload = { sub: user.id, email: user.email, tipo: user.tipo };
    const token = this.jwt.sign(payload);
    const { senhaHash, ...safe } = user;
    return {
      token,
      user: {
        ...safe,
        categorias: safe.categorias ? safe.categorias.split(',') : [],
        bairros: safe.bairros ? safe.bairros.split(',') : [],
      },
    };
  }
}
