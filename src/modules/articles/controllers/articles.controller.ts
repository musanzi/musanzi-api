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
  CreateArticleCommand,
  DeleteArticleCommand,
  UpdateArticleCommand,
  UploadArticleCoverCommand
} from '../commands';
import { CreateArticleDto, UpdateArticleDto } from '../dto';
import { Article } from '../entities/article.entity';
import { IFilterArticles } from '../interfaces';
import { FindArticleByIdQuery, FindArticleBySlugQuery, FindArticlesQuery } from '../queries';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @Roles([RoleEnum.ADMIN])
  create(@Body() dto: CreateArticleDto): Promise<Article> {
    return this.commandBus.execute(new CreateArticleCommand(dto));
  }

  @Get()
  @Public()
  findAll(@Query() query: IFilterArticles): Promise<[Article[], number]> {
    return this.queryBus.execute(new FindArticlesQuery(query));
  }

  @Get('admin')
  @Roles([RoleEnum.ADMIN])
  findAllAdmin(@Query() query: IFilterArticles): Promise<[Article[], number]> {
    return this.queryBus.execute(new FindArticlesQuery(query, true));
  }

  @Get('admin/:id')
  @Roles([RoleEnum.ADMIN])
  findOneAdmin(@Param('id') id: string): Promise<Article> {
    return this.queryBus.execute(new FindArticleByIdQuery(id, true));
  }

  @Get(':slug')
  @Public()
  findOne(@Param('slug') slug: string): Promise<Article> {
    return this.queryBus.execute(new FindArticleBySlugQuery(slug));
  }

  @Patch(':id')
  @Roles([RoleEnum.ADMIN])
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto): Promise<Article> {
    return this.commandBus.execute(new UpdateArticleCommand(id, dto));
  }

  @Post(':id/cover')
  @Roles([RoleEnum.ADMIN])
  @UseInterceptors(FileInterceptor('cover', createDiskUploadOptions('./uploads/articles')))
  uploadCover(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<Article> {
    return this.commandBus.execute(new UploadArticleCoverCommand(id, file));
  }

  @Delete(':id')
  @Roles([RoleEnum.ADMIN])
  remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteArticleCommand(id));
  }
}
