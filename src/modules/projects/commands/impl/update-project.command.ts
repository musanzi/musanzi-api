import { Command } from '@nestjs/cqrs';
import { Project } from '../../entities/project.entity';

export class UpdateProject extends Command<Project> {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly summary?: string,
    public readonly links?: { label: string; href: string }[]
  ) {
    super();
  }
}
