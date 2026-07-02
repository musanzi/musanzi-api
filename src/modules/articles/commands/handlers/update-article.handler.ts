import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tag } from '@/modules/tags/entities/tag.entity';
import { Article } from '../../entities/article.entity';
import { FindArticleByIdQuery } from '../../queries';
import { UpdateArticleCommand } from '../impl';

@CommandHandler(UpdateArticleCommand)
export class UpdateArticleHandler implements ICommandHandler<UpdateArticleCommand, Article> {
  private readonly logger = new Logger(UpdateArticleHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UpdateArticleCommand): Promise<Article> {
    const { dto, id } = command;

    try {
      const article = await this.queryBus.execute<FindArticleByIdQuery, Article>(new FindArticleByIdQuery(id, true));
      const tags = dto.tagIds ? await this.findTags(dto.tagIds) : article.tags;
      const published = dto.published ?? article.published;
      const publishedAt = this.resolvePublishedAt(article, dto.published, dto.publishedAt);

      const updatedArticle = this.repository.merge(article, {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        contentFormat: dto.contentFormat,
        cover: dto.cover,
        published,
        publishedAt,
        tags
      });

      return await this.repository.save(updatedArticle);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;

      this.logger.error(`Update article failed id="${id}": ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException("Mise à jour de l'article impossible");
    }
  }

  private async findTags(tagIds: string[]): Promise<Tag[]> {
    if (tagIds.length === 0) return [];

    const tags = await this.tagRepository.find({
      where: { id: In(tagIds) }
    });

    if (tags.length !== new Set(tagIds).size) {
      throw new BadRequestException('Un ou plusieurs tags sont introuvables');
    }

    return tags;
  }

  private resolvePublishedAt(article: Article, published?: boolean, publishedAt?: string | null): Date | null {
    if (published === false) return null;
    if (publishedAt !== undefined) return publishedAt ? new Date(publishedAt) : null;
    if (published === true && !article.publishedAt) return new Date();

    return article.publishedAt;
  }
}
