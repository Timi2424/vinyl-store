import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/db.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
