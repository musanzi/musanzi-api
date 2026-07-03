import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { FindProjectByIdQuery } from '../../queries';
import { UploadProjectImageCommand } from '../impl';

const PROJECT_UPLOAD_DIR = './uploads/projects';

@CommandHandler(UploadProjectImageCommand)
export class UploadProjectImageHandler implements ICommandHandler<UploadProjectImageCommand, Project> {
  private readonly logger = new Logger(UploadProjectImageHandler.name);

  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UploadProjectImageCommand): Promise<Project> {
    const { file, id } = command;

    try {
      const project = await this.queryBus.execute(new FindProjectByIdQuery(id));

      if (project.image) {
        await promises.unlink(join(PROJECT_UPLOAD_DIR, project.image)).catch(() => undefined);
      }

      await this.repository.update(id, { image: file.filename });

      return await this.queryBus.execute(new FindProjectByIdQuery(id));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Upload project image failed id="${id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Ajout d'image du projet impossible");
    }
  }
}
