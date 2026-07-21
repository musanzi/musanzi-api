import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { FindProjectById } from '../../queries';
import { DeleteProject } from '../impl';

@CommandHandler(DeleteProject)
export class DeleteProjectHandler implements ICommandHandler<DeleteProject, void> {
  private readonly logger = new Logger(DeleteProjectHandler.name);

  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: DeleteProject): Promise<void> {
    try {
      await this.queryBus.execute(new FindProjectById(command.id));

      await this.repository.delete(command.id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Delete project failed id="${command.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Suppression du projet impossible');
    }
  }
}
