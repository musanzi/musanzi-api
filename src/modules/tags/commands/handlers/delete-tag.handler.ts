import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { FindTagByIdQuery } from '../../queries';
import { DeleteTagCommand } from '../impl';

@CommandHandler(DeleteTagCommand)
export class DeleteTagHandler implements ICommandHandler<DeleteTagCommand, void> {
  private readonly logger = new Logger(DeleteTagHandler.name);

  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: DeleteTagCommand): Promise<void> {
    try {
      await this.queryBus.execute(new FindTagByIdQuery(command.id));
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
