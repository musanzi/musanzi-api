import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { FindTagById } from '../../queries';
import { DeleteTag } from '../impl';

@CommandHandler(DeleteTag)
export class DeleteTagHandler implements ICommandHandler<DeleteTag, void> {
  private readonly logger = new Logger(DeleteTagHandler.name);

  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: DeleteTag): Promise<void> {
    try {
      await this.queryBus.execute(new FindTagById(command.id));
      await this.repository.delete(command.id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Delete tag failed id="${command.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException('Suppression du tag impossible');
    }
  }
}
