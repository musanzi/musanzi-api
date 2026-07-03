import { BadRequestException, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { FindTagsByIdsQuery } from '@/modules/tags/queries';
import { Article } from '../../entities/article.entity';
import { CreateArticleHandler } from '../handlers/create-article.handler';
import { CreateArticleCommand } from '../impl';

describe('CreateArticleHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Article>, 'create' | 'save'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: CreateArticleHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const dto = {
    title: 'Building APIs with NestJS',
    summary: 'A practical article summary',
    content: '# Hello\n\n```ts\nconst value = true;\n```'
  };
  const article = {
    id: 'article-id',
    ...dto,
    slug: 'building-apis-with-nestjs',
    cover: null,
    publishedAt: new Date('2026-07-03T00:00:00.000Z'),
    tags: []
  } as Article;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-03T00:00:00.000Z'));
    repository = {
      create: jest.fn(),
      save: jest.fn()
    };
    queryBus = {
      execute: jest.fn()
    };
    handler = new CreateArticleHandler(
      mockDependency<Repository<Article>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.useRealTimers();
    loggerErrorSpy.mockRestore();
  });

  it('creates an article with resolved tags and today as publication date by default', async () => {
    queryBus.execute.mockResolvedValueOnce([]);
    repository.create.mockReturnValueOnce(article);
    repository.save.mockResolvedValueOnce(article);

    const result = await handler.execute(new CreateArticleCommand(dto));

    expect(result).toBe(article);
    expect(queryBus.execute).toHaveBeenCalledWith(new FindTagsByIdsQuery([]));
    expect(repository.create).toHaveBeenCalledWith({
      title: dto.title,
      summary: dto.summary,
      content: dto.content,
      publishedAt: new Date('2026-07-03T00:00:00.000Z'),
      tags: []
    });
    expect(repository.save).toHaveBeenCalledWith(article);
  });

  it('sets the publication date when the article is created with a custom date', async () => {
    const publishedAt = '2026-07-03T08:30:00.000Z';
    const articleWithCustomDate = { ...article, publishedAt: new Date(publishedAt) };
    queryBus.execute.mockResolvedValueOnce([]);
    repository.create.mockReturnValueOnce(articleWithCustomDate);
    repository.save.mockResolvedValueOnce(articleWithCustomDate);

    await handler.execute(new CreateArticleCommand({ ...dto, publishedAt }));

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        publishedAt: new Date(publishedAt)
      })
    );
  });

  it('throws BadRequestException when one of the requested tags is missing', async () => {
    queryBus.execute.mockRejectedValueOnce(new BadRequestException('Un ou plusieurs tags sont introuvables'));

    const promise = handler.execute(
      new CreateArticleCommand({ ...dto, tagIds: ['3a7bbac3-d6ce-44e9-aedb-c8fb02df23f8'] })
    );

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Un ou plusieurs tags sont introuvables');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
