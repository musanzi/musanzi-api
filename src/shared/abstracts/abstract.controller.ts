import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

@Injectable()
export abstract class AbstractController {
  constructor(
    protected readonly commandBus: CommandBus,
    protected readonly queryBus: QueryBus
  ) {}
}
