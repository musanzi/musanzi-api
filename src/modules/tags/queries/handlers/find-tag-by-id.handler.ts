import { Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { FindTagByIdQuery } from '../impl';

@QueryHandler(FindTagByIdQuery)
export class FindTagByIdHandler implements IQueryHandler<FindTagByIdQuery, Tag> {
  private readonly logger = new Logger(FindTagByIdHandler.name);

  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>
  ) {}

  async execute(query: FindTagByIdQuery): Promise<Tag> {
    try {
      return await this.repository.findOneOrFail({
        where: { id: query.id }
      });
    } catch (error) {
      this.logger.error(
        `Find tag by id failed id="${query.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new NotFoundException('Tag introuvable');
    }
  }
}
