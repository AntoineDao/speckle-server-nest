import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from './comments.schema';
import { StreamsModule } from 'src/streams/streams.module';
import { ObjectsModule } from 'src/objects/objects.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { AccountsModule } from 'src/accounts/accounts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
    AuthModule,
    StreamsModule,
    ObjectsModule,
    ProjectsModule,
    AccountsModule
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [
    CommentsService
  ]
})
export class CommentsModule {}
