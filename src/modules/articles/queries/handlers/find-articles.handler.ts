import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parsePaginationParams } from '@/shared/helpers';
import { Article } from '../../entities/article.entity';
import { FindArticlesQuery } from '../impl';

@QueryHandler(FindArticlesQuery)
export class FindArticlesHandler implements IQueryHandler<FindArticlesQuery, [Article[], number]> {
  private readonly logger = new Logger(FindArticlesHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>
  ) {}

  async execute(query: FindArticlesQuery): Promise<[Article[], number]> {
    try {
      const { q, tagId, status } = query.params;
      const queryBuilder = this.repository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.tags', 'tags')
        .where('1 = 1')
        .orderBy('article.publishedAt', 'DESC', 'NULLS LAST')
        .addOrderBy('article.updatedAt', 'DESC');

      if (!query.includeUnpublished) {
        queryBuilder.andWhere('article.publishedAt IS NOT NULL');
      } else if (status === 'draft') {
        queryBuilder.andWhere('article.publishedAt IS NULL');
      } else if (status === 'published') {
        queryBuilder.andWhere('article.publishedAt IS NOT NULL');
      }

      if (q) {
        const condition = '(article.title ILIKE :q OR article.summary ILIKE :q OR article.content ILIKE :q)';
        queryBuilder.andWhere(condition, { q: `%${q}%` });
      }

      if (tagId) {
        queryBuilder.andWhere('tags.id = :tagId', { tagId });
      }

      if (Object.keys(query.params).length > 0) {
        const { pageNumber, limitNumber } = parsePaginationParams(query.params);
        queryBuilder.skip((pageNumber - 1) * limitNumber).take(limitNumber);
      }

      return await queryBuilder.getManyAndCount();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      this.logger.error(
        `Find articles failed params="${JSON.stringify(query.params)}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw new BadRequestException('Articles introuvables');
    }
  }
}
