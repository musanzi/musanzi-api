import { BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { mockDependency } from '@/shared/helpers';
import { Tag } from '../../entities/tag.entity';
import { CreateTagHandler } from '../handlers/create-tag.handler';
import { CreateTagCommand } from '../impl';

describe('CreateTagHandler', () => {
  let repository: jest.Mocked<Pick<Repository<Tag>, 'create' | 'findOne' | 'save'>>;
  let handler: CreateTagHandler;
  let loggerErrorSpy: jest.SpyInstance;

  const dto = { name: 'NestJS' };
  const tag = { id: 'tag-id', name: 'NestJS' } as Tag;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn()
    };
    handler = new CreateTagHandler(mockDependency<Repository<Tag>>(repository));
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('creates a tag when the name is not already used', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce(tag);
    repository.save.mockResolvedValueOnce(tag);

    const result = await handler.execute(new CreateTagCommand(dto));

    expect(result).toBe(tag);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { name: 'NestJS' } });
    expect(repository.create).toHaveBeenCalledWith({ name: 'NestJS' });
    expect(repository.save).toHaveBeenCalledWith(tag);
  });

  it('throws ConflictException when the tag already exists', async () => {
    repository.findOne.mockResolvedValueOnce(tag);

    const promise = handler.execute(new CreateTagCommand(dto));

    await expect(promise).rejects.toThrow(ConflictException);
    await expect(promise).rejects.toThrow('Ce tag existe déjà');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when tag creation fails unexpectedly', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    repository.create.mockReturnValueOnce(tag);
    repository.save.mockRejectedValueOnce(new Error('database unavailable'));

    const promise = handler.execute(new CreateTagCommand(dto));

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Création du tag impossible');
  });
});
