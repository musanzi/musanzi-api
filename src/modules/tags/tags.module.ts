import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandHandlers } from './commands/handlers';
import { TagsController } from './controllers/tags.controller';
import { Tag } from './entities/tag.entity';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagsController],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [TypeOrmModule]
})
export class TagsModule {}
