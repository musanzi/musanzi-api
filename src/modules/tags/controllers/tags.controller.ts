import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Public, HasRoles } from '@/modules/auth/decorators';
import { Roles } from '@/modules/auth/enums';
import { AbstractController } from '@/shared/abstracts';
import { CreateTag, DeleteTag, UpdateTag } from '../commands';
import { CreateTagDto, UpdateTagDto } from '../dto';
import { Tag } from '../entities/tag.entity';
import { IFilterTags } from '../interfaces';
import { FindTagById, FindTags } from '../queries';

@Controller('tags')
export class TagsController extends AbstractController {
  @Post()
  @HasRoles([Roles.ADMIN])
  create(@Body() dto: CreateTagDto): Promise<Tag> {
    return this.commandBus.execute(new CreateTag(dto.name));
  }

  @Get()
  @Public()
  findAll(@Query() query: IFilterTags): Promise<[Tag[], number]> {
    return this.queryBus.execute(new FindTags(query));
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string): Promise<Tag> {
    return this.queryBus.execute(new FindTagById(id));
  }

  @Patch(':id')
  @HasRoles([Roles.ADMIN])
  update(@Param('id') id: string, @Body() dto: UpdateTagDto): Promise<Tag> {
    return this.commandBus.execute(new UpdateTag(id, dto.name));
  }

  @Delete(':id')
  @HasRoles([Roles.ADMIN])
  remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteTag(id));
  }
}
