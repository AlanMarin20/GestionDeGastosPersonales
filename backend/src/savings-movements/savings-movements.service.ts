import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingsGoal } from '../savings-goals/entities/savings-goal.entity';
import { CreateSavingsMovementDto } from './dto/create-savings-movement.dto';
import { UpdateSavingsMovementDto } from './dto/update-savings-movement.dto';
import { SavingsMovement } from './entities/savings-movement.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Balance } from '../balances/entities/balance.entity';

@Injectable()
export class SavingsMovementsService {
  constructor(
    @InjectRepository(SavingsMovement)
    private readonly movementRepository: Repository<SavingsMovement>,
    @InjectRepository(SavingsGoal)
    private readonly goalRepository: Repository<SavingsGoal>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
  ) {}

  private async findCategoriaAhorroId(): Promise<number | undefined> {
    const rows: { id: number }[] =
      await this.movimientoRepository.manager.query(
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

  async create(userId: string, createDto: CreateSavingsMovementDto) {
    const goal = await this.goalRepository.findOne({
      where: { id: createDto.goalId, user: { id: userId } },
    });
    if (!goal) {
      throw new NotFoundException(
        `Meta de ahorro con id ${createDto.goalId} no encontrada`,
      );
    }

    const tipo = createDto.tipo ?? 'deposito';
    const amount = Number(createDto.amount);
    const now = createDto.movementDate
      ? new Date(createDto.movementDate)
      : new Date();

    // Garantizar que exista fila en balances para que los triggers de BD puedan actualizarla
    await this.getOrCreateBalance(userId);

    if (tipo === 'deposito') {
      const rows: { neto: string }[] =
        await this.movimientoRepository.manager.query(
          `SELECT
          COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN tipo = 'egreso'  THEN monto ELSE 0 END), 0) AS neto
         FROM movimientos
         WHERE usuario_id = $1`,
          [userId],
        );
      const neto = Number(rows[0]?.neto ?? 0);
      if (amount > neto) {
        throw new BadRequestException(
          `El monto supera el dinero disponible (${neto.toFixed(2)})`,
        );
      }

      const categoriaId = await this.findCategoriaAhorroId();
      const movimiento = this.movimientoRepository.create({
        user: { id: userId },
        tipo: 'egreso',
        monto: amount,
        moneda: 'ARS',
        comercio: `Ahorro: ${goal.nombre}`.substring(0, 150),
        descripcion: createDto.description ?? 'Depósito a objetivo de ahorro',
        fecha: now,
        category: categoriaId ? ({ id: categoriaId } as any) : undefined,
        esTransferenciaInterna: true,
      });
      await this.movimientoRepository.save(movimiento);

      goal.currentAmount = Number(goal.currentAmount) + amount;
      await this.goalRepository.save(goal); // trigger recalcula balances.ahorro
    } else {
      // retiro
      if (amount > Number(goal.currentAmount)) {
        throw new BadRequestException(
          `El monto supera el saldo del objetivo (${Number(goal.currentAmount).toFixed(2)})`,
        );
      }

      const movimiento = this.movimientoRepository.create({
        user: { id: userId },
        tipo: 'ingreso',
        monto: amount,
        moneda: 'ARS',
        comercio: `Retiro ahorro: ${goal.nombre}`.substring(0, 150),
        descripcion: createDto.description ?? 'Retiro de objetivo de ahorro',
        fecha: now,
        esTransferenciaInterna: true,
      });
      await this.movimientoRepository.save(movimiento);

      goal.currentAmount = Math.max(0, Number(goal.currentAmount) - amount);
      await this.goalRepository.save(goal); // trigger recalcula balances.ahorro
    }

    const movement = this.movementRepository.create({
      goal,
      tipo,
      monto: amount,
      descripcion: createDto.description,
      fecha: now,
    });
    return await this.movementRepository.save(movement);
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
      throw new NotFoundException(
        `Movimiento de ahorro con id ${id} no encontrado`,
      );
    }
    return movement;
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateSavingsMovementDto,
  ) {
    const movement = await this.findOne(id, userId);

    if (
      updateDto.goalId !== undefined &&
      updateDto.goalId !== movement.goal.id
    ) {
      const newGoal = await this.goalRepository.findOne({
        where: { id: updateDto.goalId, user: { id: userId } },
      });
      if (!newGoal) {
        throw new NotFoundException(
          `Meta de ahorro con id ${updateDto.goalId} no encontrada`,
        );
      }
      movement.goal = newGoal;
    }

    if (updateDto.amount !== undefined) movement.monto = updateDto.amount;
    if (updateDto.description !== undefined)
      movement.descripcion = updateDto.description;
    if (updateDto.movementDate !== undefined)
      movement.fecha = new Date(updateDto.movementDate);

    return await this.movementRepository.save(movement);
  }

  async remove(id: string, userId: string) {
    const movement = await this.findOne(id, userId);
    await this.movementRepository.remove(movement);
    return { message: 'Movimiento de ahorro eliminado correctamente' };
  }
}
