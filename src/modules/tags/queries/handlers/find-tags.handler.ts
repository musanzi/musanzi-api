import { BadRequestException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parsePaginationParams } from '@/shared/helpers';
import { Tag } from '../../entities/tag.entity';
import { FindTags } from '../impl';

@QueryHandler(FindTags)
export class FindTagsHandler implements IQueryHandler<FindTags, [Tag[], number]> {
  private readonly logger = new Logger(FindTagsHandler.name);

  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>
  ) {}

  async execute(query: FindTags): Promise<[Tag[], number]> {
    try {
      const { q } = query.params;

      if (Object.keys(query.params).length === 0) {
        return await this.repository.findAndCount({
          order: { name: 'ASC' }
        });
      }

      const { pageNumber, limitNumber } = parsePaginationParams(query.params);
      const queryBuilder = this.repository.createQueryBuilder('tag').orderBy('tag.name', 'ASC');

      if (q) {
        queryBuilder.where('tag.name ILIKE :q', { q: `%${q}%` });
      }

      return await queryBuilder
        .skip((pageNumber - 1) * limitNumber)
        .take(limitNumber)
        .getManyAndCount();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      this.logger.error(
        `Find tags failed params="${JSON.stringify(query.params)}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Tags introuvables');
    }
  }
}
