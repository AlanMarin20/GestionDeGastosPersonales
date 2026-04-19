import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from './entities/budget.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
  ) {}

  async create(userId: string, createBudgetDto: CreateBudgetDto) {
    const budget = this.budgetRepository.create({
      amountLimit: createBudgetDto.amountLimit,
      month: createBudgetDto.month,
      year: createBudgetDto.year,
      user: { id: userId },
      category: { id: createBudgetDto.categoryId },
    });

    return await this.budgetRepository.save(budget);
  }

  async findAll(userId: string) {
    return await this.budgetRepository.find({
      where: { user: { id: userId } },
      relations: { category: true },
      order: { year: 'DESC', month: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const budget = await this.budgetRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { category: true },
    });

    if (!budget) {
      throw new NotFoundException(`Presupuesto con id ${id} no encontrado`);
    }

    return budget;
  }

  async update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto) {
    const budget = await this.findOne(id, userId);

    if (updateBudgetDto.amountLimit !== undefined) {
      budget.amountLimit = updateBudgetDto.amountLimit;
    }
    if (updateBudgetDto.month !== undefined) {
      budget.month = updateBudgetDto.month;
    }
    if (updateBudgetDto.year !== undefined) {
      budget.year = updateBudgetDto.year;
    }
    if (updateBudgetDto.categoryId !== undefined) {
      budget.category = { id: updateBudgetDto.categoryId } as Budget['category'];
    }

    return await this.budgetRepository.save(budget);
  }

  async remove(id: string, userId: string) {
    const budget = await this.findOne(id, userId);
    await this.budgetRepository.remove(budget);

    return { message: 'Presupuesto eliminado correctamente' };
  }
}
