import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsGoal } from './entities/savings-goal.entity';
import { SavingsGoalsController } from './savings-goals.controller';
import { SavingsGoalsService } from './savings-goals.service';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Balance } from '../balances/entities/balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavingsGoal, Movimiento, Balance])],
  controllers: [SavingsGoalsController],
  providers: [SavingsGoalsService],
  exports: [TypeOrmModule],
})
export class SavingsGoalsModule {}
