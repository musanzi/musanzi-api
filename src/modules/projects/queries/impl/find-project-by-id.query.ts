import { Query } from '@nestjs/cqrs';
import { Project } from '../../entities/project.entity';

export class FindProjectByIdQuery extends Query<Project> {
  constructor(public readonly id: string) {
    super();
  }
}
