import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { FindArticleById } from '../../queries';
import { UpdateArticle } from '../impl';
import { FindTagsByIds } from '@/modules/tags/queries';

@CommandHandler(UpdateArticle)
export class UpdateArticleHandler implements ICommandHandler<UpdateArticle, Article> {
  private readonly logger = new Logger(UpdateArticleHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UpdateArticle): Promise<Article> {
    const { id, title, summary, content, publishedAt, tagIds } = command;

    try {
      const article = await this.queryBus.execute(new FindArticleById(id, true));
      const tags = await this.queryBus.execute(new FindTagsByIds(tagIds ?? []));

      return await this.repository.save({
        ...article,
        title,
        summary,
        content,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        tags
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`Update article failed id="${id}": ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException("Mise à jour de l'article impossible");
    }
  }
}
