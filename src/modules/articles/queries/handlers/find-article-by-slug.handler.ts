import { Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { FindArticleBySlug } from '../impl';

@QueryHandler(FindArticleBySlug)
export class FindArticleBySlugHandler implements IQueryHandler<FindArticleBySlug, Article> {
  private readonly logger = new Logger(FindArticleBySlugHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>
  ) {}

  async execute(query: FindArticleBySlug): Promise<Article> {
    try {
      return await this.repository.findOneOrFail({
        select: ['id', 'content', 'cover', 'summary', 'title', 'createdAt', 'publishedAt', 'updatedAt', 'viewsCount'],
        where: { slug: query.slug, publishedAt: Not(IsNull()) },
        relations: ['tags']
      });
    } catch (error) {
      this.logger.error(
        `Find article by slug failed slug="${query.slug}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new NotFoundException('Article introuvable');
    }
  }
}
