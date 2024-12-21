import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/db.module';
import { VinylController } from './vinyl.controller';
import { VinylService } from './vinyl.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
    ],
    controllers: [VinylController],
    providers: [VinylService],
})
export class VinylModule {}
