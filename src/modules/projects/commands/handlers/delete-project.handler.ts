import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { FindProjectByIdQuery } from '../../queries';
import { DeleteProjectCommand } from '../impl';

@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler implements ICommandHandler<DeleteProjectCommand, void> {
  private readonly logger = new Logger(DeleteProjectHandler.name);

  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: DeleteProjectCommand): Promise<void> {
    try {
      await this.queryBus.execute(new FindProjectByIdQuery(command.id));

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
