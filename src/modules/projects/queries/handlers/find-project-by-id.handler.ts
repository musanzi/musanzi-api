import { Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { FindProjectByIdQuery } from '../impl';

@QueryHandler(FindProjectByIdQuery)
export class FindProjectByIdHandler implements IQueryHandler<FindProjectByIdQuery, Project> {
  private readonly logger = new Logger(FindProjectByIdHandler.name);

  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>
  ) {}

  async execute(query: FindProjectByIdQuery): Promise<Project> {
    try {
      return await this.repository.findOneOrFail({
        where: { id: query.id }
      });
    } catch (error) {
      this.logger.error(
        `Find project by id failed id="${query.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new NotFoundException('Projet introuvable');
    }
  }
}
