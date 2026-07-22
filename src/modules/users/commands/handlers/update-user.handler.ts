import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mapRoleIds } from '../../common/user-mappers';
import { User } from '../../entities/user.entity';
import { IUserResponse } from '../../interfaces';
import { FindUserById } from '../../queries';
import { UpdateUser } from '../impl';

@CommandHandler(UpdateUser)
export class UpdateUserHandler implements ICommandHandler<UpdateUser, IUserResponse> {
  private readonly logger = new Logger(UpdateUserHandler.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UpdateUser): Promise<IUserResponse> {
    const { id, email, name, password, avatar, roles } = command;

    try {
      const user = await this.repository.findOneOrFail({ where: { id } });
      const updatedUser = this.repository.merge(user, {
        email,
        name,
        password,
        avatar,
        roles: roles ? mapRoleIds(roles) : undefined
      });

      await this.repository.save(updatedUser);

      return this.queryBus.execute(new FindUserById(id));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`Update user failed id="${id}": ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Mise à jour impossible');
    }
  }
}
