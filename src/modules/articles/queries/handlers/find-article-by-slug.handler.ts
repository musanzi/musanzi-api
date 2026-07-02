import { Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { FindArticleBySlugQuery } from '../impl';

@QueryHandler(FindArticleBySlugQuery)
export class FindArticleBySlugHandler implements IQueryHandler<FindArticleBySlugQuery, Article> {
  private readonly logger = new Logger(FindArticleBySlugHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>
  ) {}

  async execute(query: FindArticleBySlugQuery): Promise<Article> {
    try {
      return await this.repository
        .createQueryBuilder('article')
        .addSelect('article.content')
        .leftJoinAndSelect('article.tags', 'tags')
        .where('article.slug = :slug', { slug: query.slug })
        .andWhere('article.published = true')
        .getOneOrFail();
    } catch (error) {
      this.logger.error(
        `Find article by slug failed slug="${query.slug}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new NotFoundException('Article introuvable');
    }
  }
}
