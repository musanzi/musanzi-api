import { Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { FindArticleById } from '../impl';

@QueryHandler(FindArticleById)
export class FindArticleByIdHandler implements IQueryHandler<FindArticleById, Article> {
  private readonly logger = new Logger(FindArticleByIdHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>
  ) {}

  async execute(query: FindArticleById): Promise<Article> {
    try {
      return await this.repository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.tags', 'tags')
        .where('article.id = :id', { id: query.id })
        .addSelect('article.content')
        .getOneOrFail();
    } catch (error) {
      this.logger.error(
        `Find article by id failed id="${query.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new NotFoundException('Article introuvable');
    }
  }
}
