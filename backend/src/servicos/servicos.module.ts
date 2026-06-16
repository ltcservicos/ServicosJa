import { Module } from '@nestjs/common';
import { ServicosController } from './servicos.controller';
import { VitrineController } from './vitrine.controller';
import { ServicosService } from './servicos.service';

@Module({
  controllers: [ServicosController, VitrineController],
  providers: [ServicosService],
})
export class ServicosModule {}
