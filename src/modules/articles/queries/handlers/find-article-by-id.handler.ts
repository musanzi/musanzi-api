import { Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { FindArticleByIdQuery } from '../impl';

@QueryHandler(FindArticleByIdQuery)
export class FindArticleByIdHandler implements IQueryHandler<FindArticleByIdQuery, Article> {
  private readonly logger = new Logger(FindArticleByIdHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>
  ) {}

  async execute(query: FindArticleByIdQuery): Promise<Article> {
    try {
      const queryBuilder = this.repository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.tags', 'tags')
        .where('article.id = :id', { id: query.id });

      if (query.includeContent) {
        queryBuilder.addSelect('article.content');
      }

      return await queryBuilder.getOneOrFail();
    } catch (error) {
      this.logger.error(
        `Find article by id failed id="${query.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new NotFoundException('Article introuvable');
    }
  }
}
