import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { FindProjectByIdQuery } from '../../queries';
import { UpdateProjectCommand } from '../impl';

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler implements ICommandHandler<UpdateProjectCommand, Project> {
  private readonly logger = new Logger(UpdateProjectHandler.name);

  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UpdateProjectCommand): Promise<Project> {
    const { dto, id } = command;

    try {
      const project = await this.queryBus.execute(new FindProjectByIdQuery(id));

      return await this.repository.save(this.repository.merge(project, dto));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`Update project failed id="${id}": ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Mise à jour du projet impossible');
    }
  }
}
