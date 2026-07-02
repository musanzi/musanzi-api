import { BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { CreateTagCommand } from '../impl';

@CommandHandler(CreateTagCommand)
export class CreateTagHandler implements ICommandHandler<CreateTagCommand, Tag> {
  private readonly logger = new Logger(CreateTagHandler.name);

  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>
  ) {}

  async execute(command: CreateTagCommand): Promise<Tag> {
    const { name } = command.dto;

    try {
      const tag = await this.repository.findOne({
        where: { name }
      });

      if (tag) {
        throw new ConflictException('Ce tag existe déjà');
      }

      return await this.repository.save(this.repository.create({ name }));
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      this.logger.error(`Create tag failed name="${name}": ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Création du tag impossible');
    }
  }
}
