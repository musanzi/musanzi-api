import { Logger, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Article } from '../../entities/article.entity';
import { addHyperLogLogValue } from '../../helpers';
import { IncrementArticleViewsHandler } from '../handlers/increment-article-views.handler';
import { IncrementArticleViewsCommand } from '../impl';

describe('IncrementArticleViewsHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Article>, 'manager'>>;
  let manager: jest.Mocked<Pick<EntityManager, 'getRepository' | 'transaction'>>;
  let articleRepository: {
    createQueryBuilder: jest.Mock;
    update: jest.Mock;
  };
  let queryBuilder: {
    addSelect: jest.Mock;
    setLock: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getOne: jest.Mock;
  };
  let handler: IncrementArticleViewsHandler;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn()
    };
    articleRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      update: jest.fn()
    };
    manager = {
      getRepository: jest.fn().mockReturnValue(articleRepository),
      transaction: jest.fn(async (callback: (entityManager: EntityManager) => Promise<void>) =>
        callback(mockDependency<EntityManager>(manager))
      )
    };
    repository = {
      manager: mockDependency<EntityManager>(manager)
    };
    handler = new IncrementArticleViewsHandler(mockDependency<Repository<Article>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('updates viewsCount from persisted HyperLogLog registers for a published article slug', async () => {
    queryBuilder.getOne.mockResolvedValueOnce({
      id: 'article-id',
      slug: 'building-apis',
      viewHllRegisters: [],
      viewsCount: 0
    } as Article);
    articleRepository.update.mockResolvedValueOnce({ affected: 1 } as UpdateResult);

    await handler.execute(new IncrementArticleViewsCommand('building-apis', 'viewer-fingerprint'));

    expect(queryBuilder.addSelect).toHaveBeenCalledWith('article.viewHllRegisters');
    expect(queryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(queryBuilder.where).toHaveBeenCalledWith('article.slug = :slug', { slug: 'building-apis' });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('article.publishedAt IS NOT NULL');
    expect(articleRepository.update).toHaveBeenCalledWith('article-id', {
      viewHllRegisters: expect.any(Array),
      viewsCount: 1
    });
  });

  it('does not increase the approximate count for the same viewer fingerprint', async () => {
    const [existingRegisters] = addHyperLogLogValue([], 'viewer-fingerprint');
    queryBuilder.getOne.mockResolvedValueOnce({
      id: 'article-id',
      slug: 'building-apis',
      viewHllRegisters: existingRegisters,
      viewsCount: 1
    } as Article);
    articleRepository.update.mockResolvedValueOnce({ affected: 1 } as UpdateResult);

    await handler.execute(new IncrementArticleViewsCommand('building-apis', 'viewer-fingerprint'));

    expect(articleRepository.update).toHaveBeenCalledWith('article-id', {
      viewHllRegisters: existingRegisters,
      viewsCount: 1
    });
  });

  it('throws NotFoundException when no published article is updated', async () => {
    queryBuilder.getOne.mockResolvedValueOnce(null);

    const promise = handler.execute(new IncrementArticleViewsCommand('missing-article', 'viewer-fingerprint'));

    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Article introuvable');
  });
});
