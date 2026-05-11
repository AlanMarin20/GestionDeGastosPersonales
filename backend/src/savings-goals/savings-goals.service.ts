import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { SavingsGoal } from './entities/savings-goal.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Balance } from '../balances/entities/balance.entity';

@Injectable()
export class SavingsGoalsService {
  constructor(
    @InjectRepository(SavingsGoal)
    private readonly goalRepository: Repository<SavingsGoal>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
  ) {}

  private async findCategoriaAhorroId(): Promise<number | undefined> {
    const rows: { id: number }[] = await this.movimientoRepository.manager.query(
      `SELECT id FROM categorias WHERE LOWER(nombre) = 'ahorro' AND es_default = true LIMIT 1`,
    );
    return rows[0]?.id;
  }

  private async getOrCreateBalance(userId: string): Promise<Balance> {
    let balance = await this.balanceRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!balance) {
      balance = this.balanceRepository.create({
        user: { id: userId },
        ingreso: 0,
        egreso: 0,
        ahorro: 0,
      });
      await this.balanceRepository.save(balance);
    }
    return balance;
  }

  async create(userId: string, createSavingsGoalDto: CreateSavingsGoalDto) {
    const currentAmount = createSavingsGoalDto.currentAmount ?? 0;
    const targetAmount = createSavingsGoalDto.targetAmount ?? 0;

    if (targetAmount > 0 && currentAmount > 0 && targetAmount <= currentAmount) {
      throw new BadRequestException('La meta debe ser mayor al monto inicial');
    }

    if (currentAmount > 0) {
      const rows: { neto: string }[] = await this.goalRepository.manager.query(
        `SELECT
          COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN tipo = 'egreso'  THEN monto ELSE 0 END), 0) AS neto
         FROM movimientos
         WHERE usuario_id = $1`,
        [userId],
      );
      const neto = Number(rows[0]?.neto ?? 0);
      if (currentAmount > neto) {
        throw new BadRequestException(
          `El monto inicial supera el dinero disponible (${neto.toFixed(2)})`,
        );
      }
    }

    // Garantizar que exista fila en balances para que los triggers de BD puedan actualizarla
    await this.getOrCreateBalance(userId);

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
    const saved = await this.goalRepository.save(goal); // trigger recalcula balances.ahorro

    // Si hay monto inicial, registrar el egreso; el trigger recalcula balances.egreso
    if (currentAmount > 0) {
      const categoriaId = await this.findCategoriaAhorroId();
      const movimiento = this.movimientoRepository.create({
        user: { id: userId },
        tipo: 'egreso',
        monto: currentAmount,
        moneda: 'ARS',
        comercio: `Ahorro: ${createSavingsGoalDto.name}`.substring(0, 150),
        descripcion: 'Monto inicial de objetivo de ahorro',
        fecha: new Date(),
        category: categoriaId ? ({ id: categoriaId } as any) : undefined,
        esTransferenciaInterna: true,
      });
      await this.movimientoRepository.save(movimiento);
    }

    return saved;
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

  async update(id: string, userId: string, updateSavingsGoalDto: UpdateSavingsGoalDto) {
    const goal = await this.findOne(id, userId);

    if (updateSavingsGoalDto.name !== undefined) goal.nombre = updateSavingsGoalDto.name;
    if (updateSavingsGoalDto.targetAmount !== undefined) goal.targetAmount = updateSavingsGoalDto.targetAmount;
    if (updateSavingsGoalDto.currentAmount !== undefined) goal.currentAmount = updateSavingsGoalDto.currentAmount;
    if (updateSavingsGoalDto.dueDate !== undefined) goal.dueDate = new Date(updateSavingsGoalDto.dueDate);
    if (updateSavingsGoalDto.isActive !== undefined) goal.isActive = updateSavingsGoalDto.isActive;

    return await this.goalRepository.save(goal);
  }

  async remove(id: string, userId: string) {
    const goal = await this.findOne(id, userId);
    const currentAmount = Number(goal.currentAmount ?? 0);

    // Garantizar que exista fila en balances antes de las operaciones
    await this.getOrCreateBalance(userId);

    await this.goalRepository.remove(goal); // trigger recalcula balances.ahorro

    // Devolver el saldo acumulado; el trigger recalcula balances.ingreso
    if (currentAmount > 0) {
      const movimiento = this.movimientoRepository.create({
        user: { id: userId },
        tipo: 'ingreso',
        monto: currentAmount,
        moneda: 'ARS',
        comercio: `Retiro ahorro: ${goal.nombre}`.substring(0, 150),
        descripcion: 'Objetivo de ahorro eliminado - saldo devuelto',
        fecha: new Date(),
        esTransferenciaInterna: true,
      });
      await this.movimientoRepository.save(movimiento);
    }

    return { message: 'Meta de ahorro eliminada correctamente' };
  }
}
