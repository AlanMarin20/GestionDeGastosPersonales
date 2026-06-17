import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Recommendation } from '../recommendations/entities/recommendation.entity';
import { AsesorService } from './asesor.service';
import { AsesorController } from './asesor.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Recommendation]),
    NotificationsModule,
  ],
  controllers: [AsesorController],
  providers: [AsesorService],
})
export class AsesorModule {}
