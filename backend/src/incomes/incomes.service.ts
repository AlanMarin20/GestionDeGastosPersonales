import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { Income } from './entities/income.entity';
import { Repository } from 'typeorm';
import { MovimientosService } from '../movimientos/movimientos.service';

@Injectable()
export class IncomesService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    private readonly movimientosService: MovimientosService,
  ) {}

  async create(userId: string, createIncomeDto: CreateIncomeDto) {
    return await this.movimientosService.registrar(
      userId,
      'ingreso',
      createIncomeDto.amount,
      createIncomeDto.description ?? createIncomeDto.source,
      'ARS',
      createIncomeDto.incomeDate
        ? new Date(createIncomeDto.incomeDate)
        : undefined,
      createIncomeDto.categoryId,
    );
  }

  async findAll(userId: string) {
    return await this.incomeRepository.find({
      where: { user: { id: userId } },
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const income = await this.incomeRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { category: true },
    });

    if (!income) {
      throw new NotFoundException(`Ingreso con id ${id} no encontrado`);
    }

    return income;
  }

  async update(id: string, userId: string, updateIncomeDto: UpdateIncomeDto) {
    const income = await this.findOne(id, userId);

    if (updateIncomeDto.amount !== undefined) {
      income.amount = updateIncomeDto.amount;
    }
    if (updateIncomeDto.source !== undefined) {
      income.source = updateIncomeDto.source;
    }
    if (updateIncomeDto.description !== undefined) {
      income.description = updateIncomeDto.description;
    }
    if (updateIncomeDto.incomeDate !== undefined) {
      income.incomeDate = new Date(updateIncomeDto.incomeDate);
    }
    if (updateIncomeDto.categoryId !== undefined) {
      income.category = {
        id: updateIncomeDto.categoryId,
      } as Income['category'];
    }

    return await this.incomeRepository.save(income);
  }

  async remove(id: string, userId: string) {
    const income = await this.findOne(id, userId);
    await this.incomeRepository.remove(income);

    return { message: 'Ingreso eliminado correctamente' };
  }
}
