import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { BlogService } from './blog.service';

// Páginas públicas server-rendered (fora do prefixo /api, ver main.ts)
@Controller()
export class BlogPublicController {
  constructor(private blog: BlogService) {}

  @Get('blog')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async index() {
    return this.blog.paginaIndex();
  }

  @Get('blog/:slug')
  async post(@Param('slug') slug: string, @Res() res: Response) {
    const html = await this.blog.paginaPost(slug);
    if (!html) {
      res.status(404).type('html').send(await this.blog.paginaIndex());
      return;
    }
    res.type('html').send(html);
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  sitemap() {
    return this.blog.sitemap();
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  robots() {
    return this.blog.robots();
  }
}
