import { BadRequestException, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { promises } from 'fs';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Project } from '../../entities/project.entity';
import { UploadProjectImageHandler } from '../handlers/upload-project-image.handler';
import { UploadProjectImageCommand } from '../impl';

describe('UploadProjectImageHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Project>, 'update'>>;
  let queryBus: jest.Mocked<Pick<QueryBus, 'execute'>>;
  let handler: UploadProjectImageHandler;
  let loggerErrorSpy: jest.SpyInstance;
  let unlinkSpy: jest.SpyInstance;

  const project = {
    id: 'project-id',
    name: 'Musanzi',
    image: 'old.png'
  } as Project;
  const file = { filename: 'new.png' } as Express.Multer.File;

  beforeEach(() => {
    repository = {
      update: jest.fn()
    };
    queryBus = {
      execute: jest.fn()
    };
    handler = new UploadProjectImageHandler(
      mockDependency<Repository<Project>>(repository),
      mockDependency<QueryBus>(queryBus)
    );
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    unlinkSpy = jest.spyOn(promises, 'unlink').mockResolvedValue();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
    unlinkSpy.mockRestore();
  });

  it('replaces the project image filename', async () => {
    queryBus.execute.mockResolvedValueOnce(project).mockResolvedValueOnce({
      ...project,
      image: 'new.png'
    });
    repository.update.mockResolvedValueOnce({ affected: 1, raw: [], generatedMaps: [] });

    const result = await handler.execute(new UploadProjectImageCommand('project-id', file));

    expect(repository.update).toHaveBeenCalledWith('project-id', {
      image: 'new.png'
    });
    expect(result.image).toBe('new.png');
  });

  it('throws BadRequestException when image upload update fails unexpectedly', async () => {
    queryBus.execute.mockResolvedValueOnce(project);
    repository.update.mockRejectedValueOnce(new Error('database unavailable'));
    const promise = handler.execute(new UploadProjectImageCommand('project-id', file));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow("Ajout d'image du projet impossible");
  });
});
