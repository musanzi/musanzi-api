import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { HasRoles } from '@/modules/auth/decorators';
import { Roles } from '@/modules/auth/enums';
import { IStatItem } from '../interfaces';
import { FindStats } from '../queries';

@Controller('stats')
export class StatsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @HasRoles([Roles.ADMIN])
  findAll(): Promise<IStatItem[]> {
    return this.queryBus.execute(new FindStats());
  }
}
