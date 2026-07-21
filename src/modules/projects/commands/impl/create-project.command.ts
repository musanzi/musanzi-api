import { Command } from '@nestjs/cqrs';
import { Project } from '../../entities/project.entity';

export class CreateProject extends Command<Project> {
  constructor(
    public readonly name: string,
    public readonly summary: string,
    public readonly links?: { label: string; href: string }[]
  ) {
    super();
  }
}
