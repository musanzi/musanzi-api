import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandHandlers } from './commands/handlers';
import { ProjectsController } from './controllers/projects.controller';
import { Project } from './entities/project.entity';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectsController],
  providers: [...CommandHandlers, ...QueryHandlers]
})
export class ProjectsModule {}
