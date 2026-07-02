import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, Roles } from '@/modules/auth/decorators';
import { RoleEnum } from '@/modules/auth/enums';
import { createDiskUploadOptions } from '@/shared/helpers';
import {
  CreateProjectCommand,
  DeleteProjectCommand,
  UpdateProjectCommand,
  UploadProjectImageCommand
} from '../commands';
import { CreateProjectDto, UpdateProjectDto } from '../dto';
import { Project } from '../entities/project.entity';
import { IFilterProjects } from '../interfaces';
import { FindProjectByIdQuery, FindProjectsQuery } from '../queries';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @Roles([RoleEnum.ADMIN])
  create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.commandBus.execute(new CreateProjectCommand(dto));
  }

  @Get()
  @Public()
  findAll(@Query() query: IFilterProjects): Promise<[Project[], number]> {
    return this.queryBus.execute(new FindProjectsQuery(query));
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string): Promise<Project> {
    return this.queryBus.execute(new FindProjectByIdQuery(id));
  }

  @Patch(':id')
  @Roles([RoleEnum.ADMIN])
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto): Promise<Project> {
    return this.commandBus.execute(new UpdateProjectCommand(id, dto));
  }

  @Post(':id/image')
  @Roles([RoleEnum.ADMIN])
  @UseInterceptors(FileInterceptor('image', createDiskUploadOptions('./uploads/projects')))
  uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<Project> {
    return this.commandBus.execute(new UploadProjectImageCommand(id, file));
  }

  @Delete(':id')
  @Roles([RoleEnum.ADMIN])
  remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteProjectCommand(id));
  }
}
