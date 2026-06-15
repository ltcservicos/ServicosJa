import { Module } from '@nestjs/common';
import { LocaisController } from './locais.controller';
import { LocaisService } from './locais.service';

@Module({
  controllers: [LocaisController],
  providers: [LocaisService],
  exports: [LocaisService],
})
export class LocaisModule {}
