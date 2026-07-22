import { Command } from '@nestjs/cqrs';
import { IUserResponse } from '@/modules/users/interfaces';

export class UpdateProfile extends Command<IUserResponse> {
  constructor(
    public readonly id: string,
    public readonly email?: string,
    public readonly name?: string,
    public readonly password?: string,
    public readonly avatar?: string,
    public readonly roles?: string[]
  ) {
    super();
  }
}
