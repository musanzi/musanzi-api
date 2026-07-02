import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public, Roles } from '@/modules/auth/decorators';
import { RoleEnum } from '@/modules/auth/enums';
import { CreateTagCommand, DeleteTagCommand, UpdateTagCommand } from '../commands';
import { CreateTagDto, UpdateTagDto } from '../dto';
import { Tag } from '../entities/tag.entity';
import { IFilterTags } from '../interfaces';
import { FindTagByIdQuery, FindTagsQuery } from '../queries';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @Roles([RoleEnum.ADMIN])
  create(@Body() dto: CreateTagDto): Promise<Tag> {
    return this.commandBus.execute(new CreateTagCommand(dto));
  }

  @Get()
  @Public()
  findAll(@Query() query: IFilterTags): Promise<[Tag[], number]> {
    return this.queryBus.execute(new FindTagsQuery(query));
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string): Promise<Tag> {
    return this.queryBus.execute(new FindTagByIdQuery(id));
  }

  @Patch(':id')
  @Roles([RoleEnum.ADMIN])
  update(@Param('id') id: string, @Body() dto: UpdateTagDto): Promise<Tag> {
    return this.commandBus.execute(new UpdateTagCommand(id, dto));
  }

  @Delete(':id')
  @Roles([RoleEnum.ADMIN])
  remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteTagCommand(id));
  }
}
