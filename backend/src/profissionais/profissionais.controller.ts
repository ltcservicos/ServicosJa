import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { ProfissionaisService } from './profissionais.service';

@Controller('profissionais')
@UseGuards(JwtAuthGuard)
export class ProfissionaisController {
  constructor(private profissionais: ProfissionaisService) {}

  @Get()
  listar(@CurrentUser() u: AuthUser, @Query('categoria') categoria?: string) {
    return this.profissionais.listar(u.id, categoria);
  }

  @Post(':id/curtir')
  curtir(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.profissionais.curtir(u.id, id);
  }

  @Post(':id/pular')
  pular(@Param('id') id: string, @CurrentUser() u: AuthUser) {
    return this.profissionais.pular(u.id, id);
  }
}
