import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientSchema } from './clients.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'UserAppClient', schema: ClientSchema }]),
    AuthModule,
  ],
  controllers: [
    ClientsController
  ],
  providers: [
    ClientsService
  ],
  exports: [
    ClientsService
  ]
})
export class ClientsModule {}
