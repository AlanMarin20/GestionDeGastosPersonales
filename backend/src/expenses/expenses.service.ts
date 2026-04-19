import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async create(userId: string, createExpenseDto: CreateExpenseDto) {
    const expense = this.expenseRepository.create({
      amount: createExpenseDto.amount,
      merchant: createExpenseDto.merchant,
      description: createExpenseDto.description,
      expenseDate: createExpenseDto.expenseDate
        ? new Date(createExpenseDto.expenseDate)
        : undefined,
      ticketImageUrl: createExpenseDto.ticketImageUrl,
      user: { id: userId },
      category: createExpenseDto.categoryId
        ? ({ id: createExpenseDto.categoryId } as Expense['category'])
        : undefined,
    });

    return await this.expenseRepository.save(expense);
  }

  async findAll(userId: string) {
    return await this.expenseRepository.find({
      where: { user: { id: userId } },
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const expense = await this.expenseRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { category: true },
    });

    if (!expense) {
      throw new NotFoundException(`Gasto con id ${id} no encontrado`);
    }

    return expense;
  }

  async update(id: string, userId: string, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.findOne(id, userId);

    if (updateExpenseDto.amount !== undefined) {
      expense.amount = updateExpenseDto.amount;
    }
    if (updateExpenseDto.merchant !== undefined) {
      expense.merchant = updateExpenseDto.merchant;
    }
    if (updateExpenseDto.description !== undefined) {
      expense.description = updateExpenseDto.description;
    }
    if (updateExpenseDto.expenseDate !== undefined) {
      expense.expenseDate = new Date(updateExpenseDto.expenseDate);
    }
    if (updateExpenseDto.ticketImageUrl !== undefined) {
      expense.ticketImageUrl = updateExpenseDto.ticketImageUrl;
    }
    if (updateExpenseDto.categoryId !== undefined) {
      expense.category = { id: updateExpenseDto.categoryId } as Expense['category'];
    }

    return await this.expenseRepository.save(expense);
  }

  async remove(id: string, userId: string) {
    const expense = await this.findOne(id, userId);
    await this.expenseRepository.remove(expense);

    return { message: 'Gasto eliminado correctamente' };
  }
}
