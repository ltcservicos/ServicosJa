import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { ServicosService } from './servicos.service';
import { AceitarServicoDto, AprovarPrestadorDto, AvaliarServicoDto, CreateServicoDto, EditarServicoDto } from './servicos.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ServicosController {
  constructor(private servicos: ServicosService) {}

  // --- Solicitante ---
  @Post('servicos')
  publicar(@Body() dto: CreateServicoDto, @CurrentUser() u: AuthUser) {
    return this.servicos.publicar(u.id, dto);
  }

  @Patch('servicos/:id')
  editar(@Param('id') id: string, @Body() dto: EditarServicoDto, @CurrentUser() u: AuthUser) {
    return this.servicos.editar(id, u.id, dto);
  }

  @Get('servicos/meus')
  meus(@CurrentUser() u: AuthUser) {
    return this.servicos.getMeus(u.id);
  }

  @Get('servicos/:id')
  detalhe(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.servicos.getOne(id, u.id);
  }

  @Post('servicos/:id/aprovar')
  aprovar(@Param('id') id: string, @Body() dto: AprovarPrestadorDto, @CurrentUser() u: AuthUser) {
    return this.servicos.aprovar(id, u.id, dto);
  }

  @Post('servicos/:id/concluir')
  concluir(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.servicos.concluir(id, u.id);
  }

  @Post('servicos/:id/cancelar')
  cancelar(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.servicos.cancelar(id, u.id);
  }

  @Post('servicos/:id/avaliar')
  avaliar(@Param('id') id: string, @Body() dto: AvaliarServicoDto, @CurrentUser() u: AuthUser) {
    return this.servicos.avaliar(id, u.id, dto.nota, dto.comentario);
  }

  // --- Prestador ---
  @Get('feed')
  feed(
    @CurrentUser() u: AuthUser,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('raioKm') raioKm?: string,
  ) {
    return this.servicos.getFeed(
      u.id,
      lat !== undefined ? parseFloat(lat) : undefined,
      lng !== undefined ? parseFloat(lng) : undefined,
      raioKm !== undefined ? parseFloat(raioKm) : undefined,
    );
  }

  @Post('feed/:id/aceitar')
  aceitar(@Param('id') id: string, @Body() dto: AceitarServicoDto, @CurrentUser() u: AuthUser) {
    return this.servicos.aceitar(id, u.id, dto);
  }

  @Post('feed/:id/recusar')
  recusarSwipe(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.servicos.recusarSwipe(id, u.id);
  }

  @Get('aceites/meus')
  aceites(@CurrentUser() u: AuthUser) {
    return this.servicos.getMeusAceites(u.id);
  }
}
