import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';
import { Repository } from 'typeorm';
import { MovimientosService } from '../movimientos/movimientos.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Budget } from '../budgets/entities/budget.entity';

const HIGH_EXPENSE_FALLBACK_THRESHOLD = 5000;
const HIGH_EXPENSE_BUDGET_RATIO = 0.5;

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    private readonly movimientosService: MovimientosService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createExpenseDto: CreateExpenseDto) {
    const saved = await this.movimientosService.registrar(
      userId,
      'egreso',
      createExpenseDto.amount,
      createExpenseDto.description,
      'ARS',
      createExpenseDto.expenseDate
        ? new Date(createExpenseDto.expenseDate)
        : undefined,
      createExpenseDto.categoryId,
      createExpenseDto.merchant,
    );

    this.triggerAutoNotifications(
      userId,
      createExpenseDto.amount,
      createExpenseDto.categoryId,
    ).catch(() => {});

    return saved;
  }

  private async triggerAutoNotifications(
    userId: string,
    amount: number,
    categoryId?: number,
  ) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let budget: Budget | null = null;
    if (categoryId) {
      budget = await this.budgetRepository.findOne({
        where: {
          user: { id: userId },
          category: { id: categoryId },
          month,
          year,
        },
        relations: { category: true },
      });
    }

    await this.checkGastoAlto(userId, amount, budget);

    if (budget) {
      await this.checkPresupuestoSuperado(userId, amount, budget);
    }
  }

  private async checkGastoAlto(
    userId: string,
    amount: number,
    budget: Budget | null,
  ) {
    let isHigh: boolean;
    if (budget) {
      isHigh = amount >= Number(budget.amountLimit) * HIGH_EXPENSE_BUDGET_RATIO;
    } else {
      isHigh = amount >= HIGH_EXPENSE_FALLBACK_THRESHOLD;
    }

    if (isHigh) {
      const categoryLabel = budget?.category?.name ?? 'Sin categoría';
      await this.notificationsService.create(userId, {
        message: `Gasto alto registrado: $${Number(amount).toFixed(2)} en "${categoryLabel}".`,
        type: 'warning',
      });
    }
  }

  private async checkPresupuestoSuperado(
    userId: string,
    amount: number,
    budget: Budget,
  ) {
    const now = new Date();
    const [{ prevTotal }]: [{ prevTotal: string }] =
      await this.budgetRepository.manager.query(
        `SELECT COALESCE(SUM(monto), 0) AS "prevTotal"
         FROM movimientos
         WHERE usuario_id = $1
           AND categoria_id = $2
           AND tipo = 'egreso'
           AND es_transferencia_interna = FALSE
           AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', $3::date)`,
        [userId, budget.category.id, now],
      );

    const prev = Number(prevTotal) - Number(amount);
    const limit = Number(budget.amountLimit);

    if (prev < limit && Number(prevTotal) > limit) {
      await this.notificationsService.create(userId, {
        message: `Superaste el presupuesto de "${budget.category.name}" para este mes. Límite: $${limit.toFixed(2)}, gastado: $${Number(prevTotal).toFixed(2)}.`,
        type: 'warning',
      });
    }
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
      expense.category = {
        id: updateExpenseDto.categoryId,
      } as Expense['category'];
    }

    return await this.expenseRepository.save(expense);
  }

  async remove(id: string, userId: string) {
    const expense = await this.findOne(id, userId);
    await this.expenseRepository.remove(expense);

    return { message: 'Gasto eliminado correctamente' };
  }
}
