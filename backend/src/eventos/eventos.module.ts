import { Global, Module } from '@nestjs/common';
import { EventosController } from './eventos.controller';
import { EventosService } from './eventos.service';

// Global para que qualquer serviço possa injetar EventosService e registrar eventos
@Global()
@Module({
  controllers: [EventosController],
  providers: [EventosService],
  exports: [EventosService],
})
export class EventosModule {}
