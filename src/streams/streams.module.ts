import { Module } from '@nestjs/common';
import { StreamsController } from './streams.controller';
import { StreamsService } from './streams.service';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DataStreamSchema } from './streams.schema';
import { ObjectsModule } from 'src/objects/objects.module';
import { ClientsModule } from 'src/clients/clients.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'DataStream', schema: DataStreamSchema }]),
    AuthModule,
    ObjectsModule,
    ClientsModule,
    ],
  controllers: [
    StreamsController
  ],
  providers: [
    StreamsService
  ],
  exports: [
    StreamsService,
  ]
})
export class StreamsModule {}
