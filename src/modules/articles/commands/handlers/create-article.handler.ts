import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindTagsByIds } from '@/modules/tags/queries';
import { Article } from '../../entities/article.entity';
import { CreateArticle } from '../impl';

@CommandHandler(CreateArticle)
export class CreateArticleHandler implements ICommandHandler<CreateArticle, Article> {
  private readonly logger = new Logger(CreateArticleHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: CreateArticle): Promise<Article> {
    const { title, summary, content, publishedAt, tagIds } = command;

    try {
      const tags = await this.queryBus.execute(new FindTagsByIds(tagIds ?? []));

      return await this.repository.save(
        this.repository.create({
          title,
          summary,
          content,
          publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
          tags
        })
      );
    } catch (error) {
      this.logger.error(
        `Create article failed title="${title}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Création de l'article impossible");
    }
  }
}
