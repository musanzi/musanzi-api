import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { Role } from '@/modules/roles/entities/role.entity';
import { User } from '@/modules/users/entities/user.entity';
import { IStatItem } from '../../interfaces';
import { FindStatsQuery } from '../impl';
import { Project } from '@/modules/projects/entities/project.entity';
import { Article } from '@/modules/articles/entities/article.entity';

@QueryHandler(FindStatsQuery)
export class FindStatsHandler implements IQueryHandler<FindStatsQuery, IStatItem[]> {
  private readonly logger = new Logger(FindStatsHandler.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute(): Promise<IStatItem[]> {
    try {
      const [usersTotal, rolesTotal, projectsTotal, articlesTotal] = await Promise.all([
        this.dataSource.getRepository(User).count(),
        this.dataSource.getRepository(Role).count(),
        this.dataSource.getRepository(Project).count(),
        this.dataSource.getRepository(Article).count()
      ]);

      return [
        { label: 'Utilisateurs', total: usersTotal },
        { label: 'Rôles', total: rolesTotal },
        { label: 'Projets', total: projectsTotal },
        { label: 'Articles', total: articlesTotal }
      ];
    } catch (error) {
      this.logger.error(`Find stats failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Statistiques introuvables');
    }
  }
}
