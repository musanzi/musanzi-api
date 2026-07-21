import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Tag } from '../../entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FindTagsByIds } from '../impl/find-tags-by-ids.query';

@QueryHandler(FindTagsByIds)
export class FindTagsByIdsHandler implements IQueryHandler<FindTagsByIds, Tag[]> {
  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>
  ) {}

  async execute(query: FindTagsByIds): Promise<Tag[]> {
    return await this.repository.find({
      where: { id: In(query.tagIds) }
    });
  }
}
