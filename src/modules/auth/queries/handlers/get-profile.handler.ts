import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { IUserResponse } from '@/modules/users/interfaces';
import { GetProfile } from '../impl';
import { FindUserByEmail } from '@/modules/users/queries';

@QueryHandler(GetProfile)
export class GetProfileHandler implements IQueryHandler<GetProfile, IUserResponse> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetProfile): Promise<IUserResponse> {
    const { currentUser } = query;
    return await this.queryBus.execute(new FindUserByEmail(currentUser.email));
  }
}
