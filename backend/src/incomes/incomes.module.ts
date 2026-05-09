import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomesService } from './incomes.service';
import { IncomesController } from './incomes.controller';
import { Income } from './entities/income.entity';
import { MovimientosModule } from '../movimientos/movimientos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Income]), MovimientosModule],
  controllers: [IncomesController],
  providers: [IncomesService],
})
export class IncomesModule {}
