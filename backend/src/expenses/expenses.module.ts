import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from './entities/expense.entity';
import { MovimientosModule } from '../movimientos/movimientos.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Budget } from '../budgets/entities/budget.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, Budget]),
    MovimientosModule,
    NotificationsModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
