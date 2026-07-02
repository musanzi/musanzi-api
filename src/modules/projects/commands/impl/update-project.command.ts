import { Command } from '@nestjs/cqrs';
import { UpdateProjectDto } from '../../dto';
import { Project } from '../../entities/project.entity';

export class UpdateProjectCommand extends Command<Project> {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateProjectDto
  ) {
    super();
  }
}
