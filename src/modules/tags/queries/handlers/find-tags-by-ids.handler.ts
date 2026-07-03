import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Tag } from '../../entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FindTagsByIdsQuery } from '../impl/find-tags-by-ids.query';

@QueryHandler(FindTagsByIdsQuery)
export class FindTagsByIdsHandler implements IQueryHandler<FindTagsByIdsQuery, Tag[]> {
  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>
  ) {}

  async execute(query: FindTagsByIdsQuery): Promise<Tag[]> {
    return await this.repository.find({
      where: { id: In(query.tagIds) }
    });
  }
}
