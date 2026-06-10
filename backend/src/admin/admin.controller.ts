import { Body, Controller, Delete, Get, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AdminGuard, ADMIN_PASS, ADMIN_TOKEN, ADMIN_USER } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

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
  importar(@Body() body: { categoria: string; cidade: string; bairro?: string; somenteWhatsapp?: boolean }) {
    return this.admin.importarEmpregos(body);
  }

  @Post('externo')
  @UseGuards(AdminGuard)
  postarExterno(@Body() body: { categoria: string; cidade: string; bairro?: string; descricao: string; whatsapp: string }) {
    return this.admin.postarExterno(body);
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
}
