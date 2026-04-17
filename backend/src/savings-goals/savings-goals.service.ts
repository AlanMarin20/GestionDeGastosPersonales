import { Injectable, NotFoundException } from '@nestjs/common';
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
    const goal = this.goalRepository.create({
      nombre: createSavingsGoalDto.name,
      targetAmount: createSavingsGoalDto.targetAmount,
      currentAmount: createSavingsGoalDto.currentAmount ?? 0,
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
      throw new NotFoundException(`Savings goal with id ${id} not found`);
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

    return { message: 'Savings goal deleted successfully' };
  }
}
