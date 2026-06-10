import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

// Protege as rotas de admin com um token simples (Bearer).
// O token é emitido em POST /admin/login com usuário+senha.
export const ADMIN_USER = process.env.ADMIN_USER || 'admin';
export const ADMIN_PASS = process.env.ADMIN_PASS || 'Taci123';
export const ADMIN_TOKEN = `adm_${ADMIN_USER}_${ADMIN_PASS}`; // suficiente para painel interno

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (token !== ADMIN_TOKEN) {
      throw new UnauthorizedException('Acesso restrito ao administrador');
    }
    return true;
  }
}
