import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogPublicController } from './blog.controller';

@Module({
  controllers: [BlogPublicController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
