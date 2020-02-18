import { Module, forwardRef } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsService } from './accounts.service';
import { AccountSchema } from './accounts.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Accounts', schema: AccountSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [
    AccountsController
  ],
  providers: [
    AccountsService,
  ],
  exports: [
    AccountsService,
  ]
})
export class AccountsModule {}
