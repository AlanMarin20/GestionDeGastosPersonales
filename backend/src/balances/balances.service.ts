import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from './entities/balance.entity';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { MovimientosService } from '../movimientos/movimientos.service';

@Injectable()
export class BalancesService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    private readonly movimientosService: MovimientosService,
  ) {}

  async create(userId: string, createBalanceDto: CreateBalanceDto) {
    const balance = this.balanceRepository.create({
      ingreso: createBalanceDto.ingreso,
      egreso: createBalanceDto.egreso,
      ahorro: createBalanceDto.ahorro,
      user: { id: userId },
    });

    return await this.balanceRepository.save(balance);
  }

  async findCurrentBalance(userId: string) {
    const balance = await this.balanceRepository.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    if (!balance) {
      throw new NotFoundException(
        `Balance no encontrado para el usuario ${userId}`,
      );
    }

    return balance;
  }

  async getDashboard(userId: string) {
    const balance = await this.balanceRepository.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    if (!balance) {
      return {
        gastoMensual: 0,
        dineroDisponible: 0,
        ingreso: 0,
        ahorroAcumulado: 0,
      };
    }

    const ingreso = Number(balance.ingreso);
    const egreso = Number(balance.egreso);

    return {
      gastoMensual: egreso,
      dineroDisponible: ingreso - egreso,
      ingreso,
      ahorroAcumulado: Number(balance.ahorro),
    };
  }

  async getGraficoGastos(userId: string) {
    const balance = await this.balanceRepository.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    const ingreso = balance ? Number(balance.ingreso) : 0;
    const egreso = balance ? Number(balance.egreso) : 0;
    const porcentaje = ingreso > 0 ? Math.round((egreso / ingreso) * 100 * 100) / 100 : 0;

    const meses = await this.movimientosService.getGastosMensuales(userId);

    return { porcentaje, meses };
  }

  async findAll(userId: string) {
    return await this.balanceRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    userId: string,
    updateBalanceDto: UpdateBalanceDto,
  ) {
    const balance = await this.balanceRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!balance) {
      throw new NotFoundException(`Balance con id ${id} no encontrado`);
    }

    if (updateBalanceDto.ingreso !== undefined) {
      balance.ingreso = updateBalanceDto.ingreso;
    }
    if (updateBalanceDto.egreso !== undefined) {
      balance.egreso = updateBalanceDto.egreso;
    }
    if (updateBalanceDto.ahorro !== undefined) {
      balance.ahorro = updateBalanceDto.ahorro;
    }

    return await this.balanceRepository.save(balance);
  }

  async remove(id: string, userId: string) {
    const balance = await this.balanceRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!balance) {
      throw new NotFoundException(`Balance con id ${id} no encontrado`);
    }

    await this.balanceRepository.remove(balance);
    return { success: true };
  }
}
