import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { LocaisService } from './locais.service';

// Páginas locais server-rendered (fora do prefixo /api, ver main.ts)
@Controller()
export class LocaisController {
  constructor(private locais: LocaisService) {}

  @Get('servico')
  @Header('Content-Type', 'text/html; charset=utf-8')
  index() {
    return this.locais.paginaIndex();
  }

  @Get('servico/:slug')
  servico(@Param('slug') slug: string, @Res() res: Response) {
    const html = this.locais.paginaServico(slug);
    if (!html) {
      res.status(404).type('html').send(this.locais.paginaIndex());
      return;
    }
    res.type('html').send(html);
  }
}
