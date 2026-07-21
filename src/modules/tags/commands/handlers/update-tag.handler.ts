import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { FindTagById } from '../../queries';
import { UpdateTag } from '../impl';

@CommandHandler(UpdateTag)
export class UpdateTagHandler implements ICommandHandler<UpdateTag, Tag> {
  private readonly logger = new Logger(UpdateTagHandler.name);

  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UpdateTag): Promise<Tag> {
    const { dto, id } = command;

    try {
      const tag = await this.queryBus.execute<FindTagById, Tag>(new FindTagById(id));

      if (dto.name) {
        const existingTag = await this.repository.findOne({
          where: { name: dto.name, id: Not(id) }
        });

        if (existingTag) {
          throw new ConflictException('Ce tag existe déjà');
        }
      }

      return await this.repository.save(this.repository.merge(tag, dto));
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) throw error;

      this.logger.error(`Update tag failed id="${id}": ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Mise à jour du tag impossible');
    }
  }
}
