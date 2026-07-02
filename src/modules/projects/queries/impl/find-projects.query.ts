import { Query } from '@nestjs/cqrs';
import { IFilterProjects } from '../../interfaces';
import { Project } from '../../entities/project.entity';

export class FindProjectsQuery extends Query<[Project[], number]> {
  constructor(public readonly params: IFilterProjects) {
    super();
  }
}
