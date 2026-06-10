import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { ConversasService } from './conversas.service';
import { AbrirConversaDto, EnviarMensagemDto } from './conversas.dto';

@Controller('conversas')
@UseGuards(JwtAuthGuard)
export class ConversasController {
  constructor(private conversas: ConversasService) {}

  @Post()
  abrir(@Body() dto: AbrirConversaDto, @CurrentUser() u: AuthUser) {
    return this.conversas.abrir(u.id, dto);
  }

  @Get()
  listar(@CurrentUser() u: AuthUser) {
    return this.conversas.listar(u.id);
  }

  @Get('unread-count')
  unread(@CurrentUser() u: AuthUser) {
    return this.conversas.unreadCount(u.id);
  }

  @Get(':id')
  detalhe(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.conversas.getOne(id, u.id);
  }

  @Get(':id/mensagens')
  mensagens(@Param('id') id: string, @Query('after') after: string, @CurrentUser() u: AuthUser) {
    return this.conversas.mensagens(id, u.id, after);
  }

  @Post(':id/mensagens')
  enviar(@Param('id') id: string, @Body() dto: EnviarMensagemDto, @CurrentUser() u: AuthUser) {
    return this.conversas.enviar(id, u.id, dto);
  }
}
