import { Body, Controller, Delete, Get, Param, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AdminGuard, ADMIN_PASS, ADMIN_TOKEN, ADMIN_USER } from './admin.guard';
import { AdminService } from './admin.service';
import { EventosService } from '../eventos/eventos.service';
import { BlogService } from '../blog/blog.service';

@Controller('admin')
export class AdminController {
  constructor(
    private admin: AdminService,
    private eventos: EventosService,
    private blog: BlogService,
  ) {}

  // Login simples: devolve o token usado nas demais rotas
  @Post('login')
  login(@Body() body: { usuario?: string; senha?: string }) {
    if (body?.usuario === ADMIN_USER && body?.senha === ADMIN_PASS) {
      return { token: ADMIN_TOKEN };
    }
    throw new UnauthorizedException('Usuário ou senha incorretos');
  }

  @Get('resumo')
  @UseGuards(AdminGuard)
  resumo() {
    return this.admin.resumo();
  }

  @Post('importar')
  @UseGuards(AdminGuard)
  importar(@Body() body: { categoria: string; cidade: string; bairro?: string; somenteWhatsapp?: boolean; limite?: number; maxSemWhatsapp?: number; raioRegiaoKm?: number }) {
    return this.admin.importar(body);
  }

  @Post('externo')
  @UseGuards(AdminGuard)
  postarExterno(@Body() body: { categoria: string; cidade: string; bairro?: string; descricao: string; whatsapp: string }) {
    return this.admin.postarExterno(body);
  }

  @Post('varrer')
  @UseGuards(AdminGuard)
  varrer(@Body() body: { cidades?: string[] }) {
    return this.admin.iniciarVarredura(body?.cidades);
  }

  // Rotina noturna (Guarulhos + região): ofícios link+WhatsApp, gerais só WhatsApp
  @Post('varrer-noturna')
  @UseGuards(AdminGuard)
  varrerNoturna() {
    return this.admin.iniciarVarreduraNoturna();
  }

  @Get('varrer/status')
  @UseGuards(AdminGuard)
  varrerStatus() {
    return this.admin.statusVarredura();
  }

  @Get('externos')
  @UseGuards(AdminGuard)
  listar() {
    return this.admin.listarExternos();
  }

  @Delete('externos/:id')
  @UseGuards(AdminGuard)
  remover(@Param('id') id: string) {
    return this.admin.removerExterno(id);
  }

  // ===== ANALYTICS =====
  @Get('analytics')
  @UseGuards(AdminGuard)
  analytics() {
    return this.eventos.resumo();
  }

  // ===== BLOG =====
  @Get('blog/keywords')
  @UseGuards(AdminGuard)
  blogKeywords() {
    return this.blog.keywords();
  }

  @Get('blog/posts')
  @UseGuards(AdminGuard)
  blogPosts() {
    return this.blog.listarAdmin();
  }

  @Post('blog/gerar')
  @UseGuards(AdminGuard)
  blogGerar(@Body() body: { keyword: string; publishAt?: string }) {
    return this.blog.gerar(body.keyword, body.publishAt);
  }

  @Post('blog/agendar-lote')
  @UseGuards(AdminGuard)
  blogAgendarLote() {
    return this.blog.agendarLote();
  }

  @Post('blog/posts/:id/publicar')
  @UseGuards(AdminGuard)
  blogPublicar(@Param('id') id: string) {
    return this.blog.publicarAgora(id);
  }

  @Delete('blog/posts/:id')
  @UseGuards(AdminGuard)
  blogRemover(@Param('id') id: string) {
    return this.blog.remover(id);
  }
}
