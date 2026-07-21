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
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, HasRoles } from '@/modules/auth/decorators';
import { Roles } from '@/modules/auth/enums';
import { AbstractController } from '@/shared/abstracts';
import { createDiskUploadOptions } from '@/shared/helpers';
import { CreateProject, DeleteProject, UpdateProject, UploadProjectImage } from '../commands';
import { CreateProjectDto, UpdateProjectDto } from '../dto';
import { Project } from '../entities/project.entity';
import { IFilterProjects } from '../interfaces';
import { FindProjectById, FindProjects } from '../queries';

@Controller('projects')
export class ProjectsController extends AbstractController {
  @Post()
  @HasRoles([Roles.ADMIN])
  create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.commandBus.execute(new CreateProject(dto.name, dto.summary, dto.links));
  }

  @Get()
  @Public()
  findAll(@Query() query: IFilterProjects): Promise<[Project[], number]> {
    return this.queryBus.execute(new FindProjects(query));
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string): Promise<Project> {
    return this.queryBus.execute(new FindProjectById(id));
  }

  @Patch(':id')
  @HasRoles([Roles.ADMIN])
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto): Promise<Project> {
    return this.commandBus.execute(new UpdateProject(id, dto.name, dto.summary, dto.links));
  }

  @Post(':id/image')
  @HasRoles([Roles.ADMIN])
  @UseInterceptors(FileInterceptor('image', createDiskUploadOptions('./uploads/projects')))
  uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<Project> {
    return this.commandBus.execute(new UploadProjectImage(id, file));
  }

  @Delete(':id')
  @HasRoles([Roles.ADMIN])
  remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteProject(id));
  }
}
