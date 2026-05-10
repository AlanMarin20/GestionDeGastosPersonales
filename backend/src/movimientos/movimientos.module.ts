import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movimiento } from './entities/movimiento.entity';
import { Balance } from '../balances/entities/balance.entity';
import { Category } from '../categories/entities/category.entity';
import { MovimientosService } from './movimientos.service';
import { MovimientosController } from './movimientos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Movimiento, Balance, Category])],
  controllers: [MovimientosController],
  providers: [MovimientosService],
  exports: [MovimientosService],
})
export class MovimientosModule {}
