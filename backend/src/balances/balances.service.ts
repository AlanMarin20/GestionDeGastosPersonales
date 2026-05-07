import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from './entities/balance.entity';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';

@Injectable()
export class BalancesService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
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
