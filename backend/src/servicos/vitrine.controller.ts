import { Controller, Get, Query } from '@nestjs/common';
import { ServicosService } from './servicos.service';

// Vitrine pública (SEM login). O profissional vê as vagas antes de se cadastrar;
// o detalhe completo e o "tenho interesse" pedem cadastro no front.
@Controller('vitrine')
export class VitrineController {
  constructor(private servicos: ServicosService) {}

  @Get()
  vitrine(@Query('cidade') cidade?: string, @Query('categoria') categoria?: string) {
    return this.servicos.getVitrine(cidade, categoria);
  }
}
