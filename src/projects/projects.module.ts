import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { AuthModule } from 'src/auth/auth.module';
import { ProjectSchema } from './projects.schema';
import { StreamsModule } from '../streams/streams.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Project', schema: ProjectSchema }]),
    AuthModule,
    StreamsModule,
  ],
  controllers: [
    ProjectsController
  ],
  providers: [
    ProjectsService
  ],
  exports: [
    ProjectsService
  ]
})
export class ProjectsModule {}
