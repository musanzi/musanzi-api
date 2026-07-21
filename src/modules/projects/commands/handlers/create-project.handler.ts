import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProject } from '../impl';

@CommandHandler(CreateProject)
export class CreateProjectHandler implements ICommandHandler<CreateProject, Project> {
  private readonly logger = new Logger(CreateProjectHandler.name);

  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>
  ) {}

  async execute(command: CreateProject): Promise<Project> {
    const { name, summary, links } = command;

    try {
      return await this.repository.save(this.repository.create({ name, summary, links }));
    } catch (error) {
      this.logger.error(
        `Create project failed name="${name}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Création du projet impossible');
    }
  }
}
