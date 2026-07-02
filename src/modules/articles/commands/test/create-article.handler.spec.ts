import { BadRequestException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Tag } from '@/modules/tags/entities/tag.entity';
import { Article } from '../../entities/article.entity';
import { CreateArticleHandler } from '../handlers/create-article.handler';
import { CreateArticleCommand } from '../impl';

describe('CreateArticleHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Article>, 'create' | 'findOne' | 'save'>>;
  let tagRepository: jest.Mocked<Pick<Repository<Tag>, 'find'>>;
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
    contentFormat: 'mdx',
    cover: null,
    published: false,
    publishedAt: null,
    tags: []
  } as Article;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn()
    };
    tagRepository = {
      find: jest.fn()
    };
    handler = new CreateArticleHandler(
      mockDependency<Repository<Article>>(repository),
      mockDependency<Repository<Tag>>(tagRepository)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('creates a draft article with a generated slug and MDX content format by default', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce(article);
    repository.save.mockResolvedValueOnce(article);

    const result = await handler.execute(new CreateArticleCommand(dto));

    expect(result).toBe(article);
    expect(tagRepository.find).not.toHaveBeenCalled();
    expect(repository.create).toHaveBeenCalledWith({
      title: dto.title,
      slug: 'building-apis-with-nestjs',
      summary: dto.summary,
      content: dto.content,
      contentFormat: 'mdx',
      cover: null,
      published: false,
      publishedAt: null,
      tags: []
    });
    expect(repository.save).toHaveBeenCalledWith(article);
  });

  it('adds a numeric suffix when an article slug already exists', async () => {
    repository.findOne.mockResolvedValueOnce(article).mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce({ ...article, slug: 'building-apis-with-nestjs-2' });
    repository.save.mockResolvedValueOnce({ ...article, slug: 'building-apis-with-nestjs-2' });

    await handler.execute(new CreateArticleCommand(dto));

    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { slug: 'building-apis-with-nestjs' } });
    expect(repository.findOne).toHaveBeenNthCalledWith(2, { where: { slug: 'building-apis-with-nestjs-2' } });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'building-apis-with-nestjs-2' }));
  });

  it('throws BadRequestException when one of the requested tags is missing', async () => {
    tagRepository.find.mockResolvedValueOnce([]);

    const promise = handler.execute(
      new CreateArticleCommand({ ...dto, tagIds: ['3a7bbac3-d6ce-44e9-aedb-c8fb02df23f8'] })
    );

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Un ou plusieurs tags sont introuvables');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
