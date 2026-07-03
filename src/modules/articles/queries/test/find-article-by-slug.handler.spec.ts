import { Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Article } from '../../entities/article.entity';
import { FindArticleBySlugHandler } from '../handlers/find-article-by-slug.handler';
import { FindArticleBySlugQuery } from '../impl';

describe('FindArticleBySlugHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Article>, 'findOneOrFail'>>;
  let handler: FindArticleBySlugHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const article = {
    id: 'article-id',
    title: 'Building APIs',
    slug: 'building-apis',
    summary: 'Summary',
    content: 'Content',
    publishedAt: new Date('2026-07-03T00:00:00.000Z')
  } as Article;

  beforeEach(() => {
    repository = {
      findOneOrFail: jest.fn()
    };
    handler = new FindArticleBySlugHandler(mockDependency<Repository<Article>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns a published article by slug', async () => {
    repository.findOneOrFail.mockResolvedValueOnce(article);

    const result = await handler.execute(new FindArticleBySlugQuery('building-apis'));

    expect(result).toBe(article);
    expect(repository.findOneOrFail).toHaveBeenCalledWith({
      select: ['id', 'content', 'cover', 'summary', 'title', 'createdAt', 'publishedAt', 'updatedAt'],
      where: {
        slug: 'building-apis',
        publishedAt: expect.any(Object)
      },
      relations: ['tags']
    });
  });

  it('throws NotFoundException when the published article cannot be found', async () => {
    repository.findOneOrFail.mockRejectedValueOnce(new Error('not found'));

    const promise = handler.execute(new FindArticleBySlugQuery('missing-article'));

    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Article introuvable');
  });
});
