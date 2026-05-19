import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from './entities/balance.entity';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { MovimientosService } from '../movimientos/movimientos.service';

@Injectable()
export class BalancesService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    private readonly movimientosService: MovimientosService,
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

  async getDashboard(userId: string) {
    // Stats del mes actual: excluye transferencias internas (depósitos/retiros de ahorro)
    const statsRows: { egreso: string; ingreso: string }[] =
      await this.balanceRepository.manager.query(
        `SELECT
          COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0) AS egreso,
          COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) AS ingreso
         FROM movimientos
         WHERE usuario_id = $1
           AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
           AND es_transferencia_interna = FALSE`,
        [userId],
      );

    // Dinero disponible: saldo neto acumulado de todos los movimientos (incluye transferencias)
    const netoRows: { neto: string }[] =
      await this.balanceRepository.manager.query(
        `SELECT
          COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN tipo = 'egreso'  THEN monto ELSE 0 END), 0) AS neto
         FROM movimientos
         WHERE usuario_id = $1`,
        [userId],
      );

    // Ahorro acumulado: suma de monto_actual de todas las metas activas del usuario
    const ahorroRows: { total: string }[] =
      await this.balanceRepository.manager.query(
        `SELECT COALESCE(SUM(monto_actual), 0) AS total
         FROM metas_ahorro
         WHERE usuario_id = $1`,
        [userId],
      );

    const gastoMensual = Number(statsRows[0]?.egreso ?? 0);
    const ingresoMensual = Number(statsRows[0]?.ingreso ?? 0);
    const dineroDisponible = Number(netoRows[0]?.neto ?? 0);
    const ahorroAcumulado = Number(ahorroRows[0]?.total ?? 0);

    return {
      gastoMensual,
      dineroDisponible,
      ingreso: ingresoMensual,
      ahorroAcumulado,
    };
  }

  async getGraficoGastos(userId: string) {
    // Calcula totales excluyendo transferencias internas para que la proporción sea real
    const totalesRows: { ingreso: string; egreso: string }[] =
      await this.balanceRepository.manager.query(
        `SELECT
          COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) AS ingreso,
          COALESCE(SUM(CASE WHEN tipo = 'egreso'  THEN monto ELSE 0 END), 0) AS egreso
         FROM movimientos
         WHERE usuario_id = $1
           AND es_transferencia_interna = FALSE`,
        [userId],
      );

    const ingreso = Number(totalesRows[0]?.ingreso ?? 0);
    const egreso = Number(totalesRows[0]?.egreso ?? 0);
    const porcentaje =
      ingreso > 0 ? Math.round((egreso / ingreso) * 100 * 100) / 100 : 0;

    const meses = await this.movimientosService.getGastosMensuales(userId);

    return { porcentaje, meses };
  }

  async findAll(userId: string) {
    return await this.balanceRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, userId: string, updateBalanceDto: UpdateBalanceDto) {
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

  async getResumenAsesor(advisorId: string): Promise<{
    clientesAsignados: number;
    riesgoMedio: number;
    riesgoAlto: number;
  }> {
    const rows: {
      clientes_asignados: string;
      riesgo_medio: string;
      riesgo_alto: string;
    }[] = await this.balanceRepository.manager.query(
      `
        SELECT
          COUNT(*) AS clientes_asignados,
          COUNT(*) FILTER (
            WHERE b.ingreso > 0
            AND (b.egreso / b.ingreso) >= 0.90
            AND (b.egreso / b.ingreso) < 0.95
          ) AS riesgo_medio,
          COUNT(*) FILTER (
            WHERE b.ingreso > 0
            AND (b.egreso / b.ingreso) >= 0.95
          ) AS riesgo_alto
        FROM usuarios u
        LEFT JOIN balances b ON b.usuario_id = u.id
        WHERE u.asesor_id = $1
        `,
      [advisorId],
    );

    const row = rows[0];
    return {
      clientesAsignados: Number(row.clientes_asignados),
      riesgoMedio: Number(row.riesgo_medio),
      riesgoAlto: Number(row.riesgo_alto),
    };
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
