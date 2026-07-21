import { Command } from '@nestjs/cqrs';
import { UpdateProjectDto } from '../../dto';
import { Project } from '../../entities/project.entity';

export class UpdateProject extends Command<Project> {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateProjectDto
  ) {
    super();
  }
}
