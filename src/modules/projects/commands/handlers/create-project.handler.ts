import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectCommand } from '../impl';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand, Project> {
  private readonly logger = new Logger(CreateProjectHandler.name);

  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>
  ) {}

  async execute(command: CreateProjectCommand): Promise<Project> {
    try {
      return await this.repository.save(
        this.repository.create({
          ...command.dto,
          image: command.dto.image ?? null,
          links: command.dto.links ?? []
        })
      );
    } catch (error) {
      this.logger.error(
        `Create project failed name="${command.dto.name}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Création du projet impossible');
    }
  }
}
