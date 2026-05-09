import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AsesorService } from './asesor.service';
import { AsesorController } from './asesor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AsesorController],
  providers: [AsesorService],
})
export class AsesorModule {}
