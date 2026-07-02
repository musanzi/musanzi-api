import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { FindArticleByIdQuery } from '../../queries';
import { DeleteArticleCommand } from '../impl';

@CommandHandler(DeleteArticleCommand)
export class DeleteArticleHandler implements ICommandHandler<DeleteArticleCommand, void> {
  private readonly logger = new Logger(DeleteArticleHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: DeleteArticleCommand): Promise<void> {
    try {
      await this.queryBus.execute(new FindArticleByIdQuery(command.id));
      await this.repository.delete(command.id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Delete article failed id="${command.id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Suppression de l'article impossible");
    }
  }
}
