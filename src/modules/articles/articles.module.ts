import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandHandlers } from './commands/handlers';
import { ArticlesController } from './controllers/articles.controller';
import { Article } from './entities/article.entity';
import { QueryHandlers } from './queries/handlers';
import { ArticleSubscriber } from './subscribers/article.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  controllers: [ArticlesController],
  providers: [ArticleSubscriber, ...CommandHandlers, ...QueryHandlers]
})
export class ArticlesModule {}
