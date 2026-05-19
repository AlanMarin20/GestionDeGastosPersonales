import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsGoal } from '../savings-goals/entities/savings-goal.entity';
import { SavingsMovement } from './entities/savings-movement.entity';
import { SavingsMovementsController } from './savings-movements.controller';
import { SavingsMovementsService } from './savings-movements.service';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Balance } from '../balances/entities/balance.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SavingsMovement,
      SavingsGoal,
      Movimiento,
      Balance,
    ]),
    NotificationsModule,
  ],
  controllers: [SavingsMovementsController],
  providers: [SavingsMovementsService],
})
export class SavingsMovementsModule {}
