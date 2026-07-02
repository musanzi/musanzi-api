import { BadRequestException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Project } from '../../entities/project.entity';
import { CreateProjectHandler } from '../handlers/create-project.handler';
import { CreateProjectCommand } from '../impl';

describe('CreateProjectHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Project>, 'create' | 'save'>>;
  let handler: CreateProjectHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const dto = {
    name: 'Musanzi',
    summary: 'Project summary'
  };
  const project = { id: 'project-id', ...dto, image: null, links: [] } as Project;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn()
    };
    handler = new CreateProjectHandler(mockDependency<Repository<Project>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('creates a project with empty links and no image by default', async () => {
    repository.create.mockReturnValueOnce(project);
    repository.save.mockResolvedValueOnce(project);

    const result = await handler.execute(new CreateProjectCommand(dto));

    expect(result).toBe(project);
    expect(repository.create).toHaveBeenCalledWith({ ...dto, image: null, links: [] });
    expect(repository.save).toHaveBeenCalledWith(project);
  });

  it('throws BadRequestException when project creation fails unexpectedly', async () => {
    repository.create.mockReturnValueOnce(project);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new CreateProjectCommand(dto));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Création du projet impossible');
  });
});
