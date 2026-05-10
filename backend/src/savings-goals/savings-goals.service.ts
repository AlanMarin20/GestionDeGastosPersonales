import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { SavingsGoal } from './entities/savings-goal.entity';

@Injectable()
export class SavingsGoalsService {
  constructor(
    @InjectRepository(SavingsGoal)
    private readonly goalRepository: Repository<SavingsGoal>,
  ) {}

  async create(userId: string, createSavingsGoalDto: CreateSavingsGoalDto) {
    const currentAmount = createSavingsGoalDto.currentAmount ?? 0;
    const targetAmount = createSavingsGoalDto.targetAmount ?? 0;

    if (targetAmount > 0 && currentAmount > 0 && targetAmount <= currentAmount) {
      throw new BadRequestException(
        'La meta debe ser mayor al monto inicial',
      );
    }

    if (currentAmount > 0) {
      const rows: { disponible: string }[] =
        await this.goalRepository.manager.query(
          `SELECT
            COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0) AS disponible
           FROM movimientos
           WHERE usuario_id = $1
             AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)`,
          [userId],
        );
      const disponible = Number(rows[0]?.disponible ?? 0);
      if (currentAmount > disponible) {
        throw new BadRequestException(
          `El monto inicial supera el dinero disponible este mes (${disponible.toFixed(2)})`,
        );
      }
    }

    const goal = this.goalRepository.create({
      nombre: createSavingsGoalDto.name,
      targetAmount,
      currentAmount,
      dueDate: createSavingsGoalDto.dueDate
        ? new Date(createSavingsGoalDto.dueDate)
        : undefined,
      isActive: createSavingsGoalDto.isActive ?? true,
      user: { id: userId },
    });

    return await this.goalRepository.save(goal);
  }

  async findAll(userId: string) {
    return await this.goalRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const goal = await this.goalRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!goal) {
      throw new NotFoundException(`Meta de ahorro con id ${id} no encontrada`);
    }

    return goal;
  }

  async update(
    id: string,
    userId: string,
    updateSavingsGoalDto: UpdateSavingsGoalDto,
  ) {
    const goal = await this.findOne(id, userId);

    if (updateSavingsGoalDto.name !== undefined) {
      goal.nombre = updateSavingsGoalDto.name;
    }
    if (updateSavingsGoalDto.targetAmount !== undefined) {
      goal.targetAmount = updateSavingsGoalDto.targetAmount;
    }
    if (updateSavingsGoalDto.currentAmount !== undefined) {
      goal.currentAmount = updateSavingsGoalDto.currentAmount;
    }
    if (updateSavingsGoalDto.dueDate !== undefined) {
      goal.dueDate = new Date(updateSavingsGoalDto.dueDate);
    }
    if (updateSavingsGoalDto.isActive !== undefined) {
      goal.isActive = updateSavingsGoalDto.isActive;
    }

    return await this.goalRepository.save(goal);
  }

  async remove(id: string, userId: string) {
    const goal = await this.findOne(id, userId);
    await this.goalRepository.remove(goal);

    return { message: 'Meta de ahorro eliminada correctamente' };
  }
}
