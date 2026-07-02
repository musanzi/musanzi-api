import { Command } from '@nestjs/cqrs';
import { CreateProjectDto } from '../../dto';
import { Project } from '../../entities/project.entity';

export class CreateProjectCommand extends Command<Project> {
  constructor(public readonly dto: CreateProjectDto) {
    super();
  }
}
