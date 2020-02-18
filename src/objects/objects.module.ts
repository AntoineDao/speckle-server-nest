import { Module } from '@nestjs/common';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SpeckleObjectSchema } from './objects.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'SpeckleObjects', schema: SpeckleObjectSchema}]),
    AuthModule,
  ],
  controllers: [
    ObjectsController
  ],
  providers: [
    ObjectsService
  ],
  exports: [
    ObjectsService
  ]
})
export class ObjectsModule {}
