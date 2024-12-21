import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './db/db.module';
import { PaymentModule } from './payment/payment.module';
import { EmailModule } from './email/email.module';
import { VinylModule } from './vinyl/vinyl.module';
import { AdminModule } from './admin/admin.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
    }),
    ReviewModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    PaymentModule,
    EmailModule,
    VinylModule,
    AdminModule,
  ],
})
export class AppModule {}
