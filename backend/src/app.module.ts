import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicosModule } from './servicos/servicos.module';
import { AcoesModule } from './acoes/acoes.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { ConversasModule } from './conversas/conversas.module';
import { AdminModule } from './admin/admin.module';
import { ProfissionaisModule } from './profissionais/profissionais.module';
import { EventosModule } from './eventos/eventos.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    PrismaModule,
    EventosModule,
    AuthModule,
    UsersModule,
    ServicosModule,
    AcoesModule,
    NotificacoesModule,
    ConversasModule,
    AdminModule,
    ProfissionaisModule,
    BlogModule,
  ],
})
export class AppModule {}
