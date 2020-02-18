import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { ObjectsModule } from './objects/objects.module';
import { StreamsModule } from './streams/streams.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    AccountsModule,
    AuthModule,
    ObjectsModule,
    StreamsModule,
    ClientsModule,
    ProjectsModule,
    CommentsModule
  ],
  providers: [
  ],
})
export class AppModule {}
