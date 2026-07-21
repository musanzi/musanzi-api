import { Query } from '@nestjs/cqrs';
import { Project } from '../../entities/project.entity';

export class FindProjectById extends Query<Project> {
  constructor(public readonly id: string) {
    super();
  }
}
