import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parsePaginationParams } from '@/shared/helpers';
import { Project } from '../../entities/project.entity';
import { FindProjects } from '../impl';

@QueryHandler(FindProjects)
export class FindProjectsHandler implements IQueryHandler<FindProjects, [Project[], number]> {
  private readonly logger = new Logger(FindProjectsHandler.name);

  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>
  ) {}

  async execute(query: FindProjects): Promise<[Project[], number]> {
    try {
      const { q } = query.params;

      if (Object.keys(query.params).length === 0) {
        return await this.repository.findAndCount({
          order: { updatedAt: 'DESC' }
        });
      }

      const { pageNumber, limitNumber } = parsePaginationParams(query.params);
      const queryBuilder = this.repository.createQueryBuilder('project').orderBy('project.updatedAt', 'DESC');

      if (q) {
        queryBuilder.where('project.name ILIKE :q OR project.summary ILIKE :q', { q: `%${q}%` });
      }

      return await queryBuilder
        .skip((pageNumber - 1) * limitNumber)
        .take(limitNumber)
        .getManyAndCount();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      this.logger.error(
        `Find projects failed params="${JSON.stringify(query.params)}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw new BadRequestException('Projets introuvables');
    }
  }
}
