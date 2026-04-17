import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingsGoal } from '../savings-goals/entities/savings-goal.entity';
import { CreateSavingsMovementDto } from './dto/create-savings-movement.dto';
import { UpdateSavingsMovementDto } from './dto/update-savings-movement.dto';
import { SavingsMovement } from './entities/savings-movement.entity';

@Injectable()
export class SavingsMovementsService {
  constructor(
    @InjectRepository(SavingsMovement)
    private readonly movementRepository: Repository<SavingsMovement>,
    @InjectRepository(SavingsGoal)
    private readonly goalRepository: Repository<SavingsGoal>,
  ) {}

  async create(userId: string, createDto: CreateSavingsMovementDto) {
    const goal = await this.goalRepository.findOne({
      where: { id: createDto.goalId, user: { id: userId } },
    });

    if (!goal) {
      throw new NotFoundException(
        `Savings goal with id ${createDto.goalId} not found`,
      );
    }

    const movement = this.movementRepository.create({
      goal,
      monto: createDto.amount,
      descripcion: createDto.description,
      fecha: createDto.movementDate
        ? new Date(createDto.movementDate)
        : undefined,
    });

    const savedMovement = await this.movementRepository.save(movement);

    goal.currentAmount =
      Number(goal.currentAmount ?? 0) + Number(savedMovement.monto ?? 0);
    await this.goalRepository.save(goal);

    return savedMovement;
  }

  async findAll(userId: string) {
    return await this.movementRepository.find({
      where: { goal: { user: { id: userId } } },
      relations: { goal: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const movement = await this.movementRepository.findOne({
      where: { id, goal: { user: { id: userId } } },
      relations: { goal: true },
    });

    if (!movement) {
      throw new NotFoundException(`Savings movement with id ${id} not found`);
    }

    return movement;
  }

  async update(id: string, userId: string, updateDto: UpdateSavingsMovementDto) {
    const movement = await this.findOne(id, userId);

    if (updateDto.goalId !== undefined && updateDto.goalId !== movement.goal.id) {
      const newGoal = await this.goalRepository.findOne({
        where: { id: updateDto.goalId, user: { id: userId } },
      });

      if (!newGoal) {
        throw new NotFoundException(
          `Savings goal with id ${updateDto.goalId} not found`,
        );
      }

      movement.goal = newGoal;
    }

    if (updateDto.amount !== undefined) {
      movement.monto = updateDto.amount;
    }
    if (updateDto.description !== undefined) {
      movement.descripcion = updateDto.description;
    }
    if (updateDto.movementDate !== undefined) {
      movement.fecha = new Date(updateDto.movementDate);
    }

    return await this.movementRepository.save(movement);
  }

  async remove(id: string, userId: string) {
    const movement = await this.findOne(id, userId);
    await this.movementRepository.remove(movement);

    return { message: 'Savings movement deleted successfully' };
  }
}
