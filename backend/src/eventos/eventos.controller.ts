import { Controller, Post } from '@nestjs/common';
import { EventosService } from './eventos.service';

// Ping público de visita (chamado pela landing). Sem auth, sem dados pessoais.
@Controller('eventos')
export class EventosController {
  constructor(private eventos: EventosService) {}

  @Post('visita')
  visita() {
    this.eventos.track('VISITA');
    return { ok: true };
  }
}
