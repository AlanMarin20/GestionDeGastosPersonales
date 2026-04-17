import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsGoal } from '../savings-goals/entities/savings-goal.entity';
import { SavingsMovement } from './entities/savings-movement.entity';
import { SavingsMovementsController } from './savings-movements.controller';
import { SavingsMovementsService } from './savings-movements.service';

@Module({
  imports: [TypeOrmModule.forFeature([SavingsMovement, SavingsGoal])],
  controllers: [SavingsMovementsController],
  providers: [SavingsMovementsService],
})
export class SavingsMovementsModule {}
