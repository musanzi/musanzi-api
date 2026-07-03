import { BadRequestException, Logger } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Article } from '../../entities/article.entity';
import { FindArticlesHandler } from '../handlers/find-articles.handler';
import { FindArticlesQuery } from '../impl';

describe('FindArticlesHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Article>, 'createQueryBuilder'>>;
  let queryBuilder: jest.Mocked<
    Pick<
      SelectQueryBuilder<Article>,
      'leftJoinAndSelect' | 'where' | 'orderBy' | 'addOrderBy' | 'andWhere' | 'skip' | 'take' | 'getManyAndCount'
    >
  >;
  let handler: FindArticlesHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const articles = [
    {
      id: 'article-id',
      title: 'Building APIs',
      slug: 'building-apis',
      summary: 'Summary',
      publishedAt: new Date('2026-07-03T00:00:00.000Z')
    }
  ] as Article[];

  beforeEach(() => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      addOrderBy: jest.fn(),
      andWhere: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      getManyAndCount: jest.fn()
    };
    queryBuilder.leftJoinAndSelect.mockReturnValue(mockDependency<SelectQueryBuilder<Article>>(queryBuilder));
    queryBuilder.where.mockReturnValue(mockDependency<SelectQueryBuilder<Article>>(queryBuilder));
    queryBuilder.orderBy.mockReturnValue(mockDependency<SelectQueryBuilder<Article>>(queryBuilder));
    queryBuilder.addOrderBy.mockReturnValue(mockDependency<SelectQueryBuilder<Article>>(queryBuilder));
    queryBuilder.andWhere.mockReturnValue(mockDependency<SelectQueryBuilder<Article>>(queryBuilder));
    queryBuilder.skip.mockReturnValue(mockDependency<SelectQueryBuilder<Article>>(queryBuilder));
    queryBuilder.take.mockReturnValue(mockDependency<SelectQueryBuilder<Article>>(queryBuilder));
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
    };
    handler = new FindArticlesHandler(mockDependency<Repository<Article>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns published articles only for public article lists', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([articles, 1]);

    const result = await handler.execute(new FindArticlesQuery({}));

    expect(result).toEqual([articles, 1]);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('article');
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('article.tags', 'tags');
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('article.publishedAt IS NOT NULL');
    expect(queryBuilder.skip).not.toHaveBeenCalled();
    expect(queryBuilder.take).not.toHaveBeenCalled();
  });

  it('filters admin draft lists by status, search, tag id, and pagination', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([articles, 1]);

    const result = await handler.execute(
      new FindArticlesQuery(
        {
          status: 'draft',
          q: 'nestjs',
          tagId: '3a7bbac3-d6ce-44e9-aedb-c8fb02df23f8',
          page: 2,
          limit: 10
        },
        true
      )
    );

    expect(result).toEqual([articles, 1]);
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('article.publishedAt IS NULL');
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(article.title ILIKE :q OR article.summary ILIKE :q OR article.content ILIKE :q)',
      { q: '%nestjs%' }
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('tags.id = :tagId', {
      tagId: '3a7bbac3-d6ce-44e9-aedb-c8fb02df23f8'
    });
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
  });

  it('throws BadRequestException when pagination parameters are invalid', async () => {
    const promise = handler.execute(new FindArticlesQuery({ page: 1, limit: 101 }));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Les paramètres de pagination sont invalides');
    expect(queryBuilder.getManyAndCount).not.toHaveBeenCalled();
  });
});
