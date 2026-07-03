import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { FindArticleByIdQuery } from '../../queries';
import { UpdateArticleCommand } from '../impl';
import { FindTagsByIdsQuery } from '@/modules/tags/queries';

@CommandHandler(UpdateArticleCommand)
export class UpdateArticleHandler implements ICommandHandler<UpdateArticleCommand, Article> {
  private readonly logger = new Logger(UpdateArticleHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UpdateArticleCommand): Promise<Article> {
    const { dto, id } = command;

    try {
      const article = await this.queryBus.execute(new FindArticleByIdQuery(id, true));
      const tags = await this.queryBus.execute(new FindTagsByIdsQuery(dto.tagIds ?? []));

      const updatedArticle = this.repository.merge(article, {
        ...dto,
        publishedAt: new Date(dto.publishedAt),
        tags
      });

      return await this.repository.save(updatedArticle);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`Update article failed id="${id}": ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException("Mise à jour de l'article impossible");
    }
  }
}
