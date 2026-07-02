import { BadRequestException, Logger } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Project } from '../../entities/project.entity';
import { FindProjectsHandler } from '../handlers/find-projects.handler';
import { FindProjectsQuery } from '../impl';

describe('FindProjectsHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Project>, 'createQueryBuilder' | 'findAndCount'>>;
  let queryBuilder: jest.Mocked<
    Pick<SelectQueryBuilder<Project>, 'orderBy' | 'where' | 'skip' | 'take' | 'getManyAndCount'>
  >;
  let handler: FindProjectsHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const projects = [{ id: 'project-id', name: 'Musanzi', summary: 'Project summary' }] as Project[];

  beforeEach(() => {
    queryBuilder = {
      orderBy: jest.fn(),
      where: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      getManyAndCount: jest.fn()
    };
    queryBuilder.orderBy.mockReturnValue(mockDependency<SelectQueryBuilder<Project>>(queryBuilder));
    queryBuilder.where.mockReturnValue(mockDependency<SelectQueryBuilder<Project>>(queryBuilder));
    queryBuilder.skip.mockReturnValue(mockDependency<SelectQueryBuilder<Project>>(queryBuilder));
    queryBuilder.take.mockReturnValue(mockDependency<SelectQueryBuilder<Project>>(queryBuilder));
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findAndCount: jest.fn()
    };
    handler = new FindProjectsHandler(mockDependency<Repository<Project>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns all projects without pagination when no query params are provided', async () => {
    repository.findAndCount.mockResolvedValueOnce([projects, 1]);

    const result = await handler.execute(new FindProjectsQuery({}));

    expect(result).toEqual([projects, 1]);
    expect(repository.findAndCount).toHaveBeenCalledWith({ order: { updatedAt: 'DESC' } });
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('returns filtered projects using the requested page, limit, and search query', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([projects, 1]);

    const result = await handler.execute(new FindProjectsQuery({ page: 2, limit: 25, q: 'mus' }));

    expect(result).toEqual([projects, 1]);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('project');
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('project.updatedAt', 'DESC');
    expect(queryBuilder.where).toHaveBeenCalledWith('project.name ILIKE :q OR project.summary ILIKE :q', {
      q: '%mus%'
    });
    expect(queryBuilder.skip).toHaveBeenCalledWith(25);
    expect(queryBuilder.take).toHaveBeenCalledWith(25);
    expect(queryBuilder.getManyAndCount).toHaveBeenCalledTimes(1);
  });

  it('throws BadRequestException when pagination parameters are invalid', async () => {
    const promise = handler.execute(new FindProjectsQuery({ page: 1, limit: 101 }));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Les paramètres de pagination sont invalides');
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });
});
