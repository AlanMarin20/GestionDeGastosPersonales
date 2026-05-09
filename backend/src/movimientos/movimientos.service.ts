import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimiento, TipoMovimiento } from './entities/movimiento.entity';
import { Balance } from '../balances/entities/balance.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
  ) {}

  private async syncBalance(userId: string, tipo: TipoMovimiento, delta: number) {
    let balance = await this.balanceRepository.findOne({ where: { user: { id: userId } } });
    if (!balance) {
      balance = this.balanceRepository.create({ user: { id: userId }, ingreso: 0, egreso: 0, ahorro: 0 });
    }
    if (tipo === 'ingreso') {
      balance.ingreso = Number(balance.ingreso) + delta;
    } else {
      balance.egreso = Number(balance.egreso) + delta;
    }
    await this.balanceRepository.save(balance);
  }

  async create(userId: string, dto: CreateMovimientoDto) {
    const movimiento = this.movimientoRepository.create({
      user: { id: userId },
      tipo: dto.tipo,
      monto: dto.monto,
      moneda: dto.moneda ?? 'ARS',
      descripcion: dto.descripcion,
      fecha: dto.fecha ? new Date(dto.fecha) : undefined,
    });
    const saved = await this.movimientoRepository.save(movimiento);
    await this.syncBalance(userId, dto.tipo, Number(dto.monto));
    return saved;
  }

  async registrar(
    userId: string,
    tipo: TipoMovimiento,
    monto: number,
    descripcion?: string,
    moneda = 'ARS',
    fecha?: Date,
    categoriaId?: number,
    comercio?: string,
  ) {
    const movimiento = this.movimientoRepository.create({
      user: { id: userId },
      tipo,
      monto,
      moneda,
      descripcion,
      fecha,
      category: categoriaId ? ({ id: categoriaId } as any) : undefined,
      comercio,
    });
    const saved = await this.movimientoRepository.save(movimiento);
    await this.syncBalance(userId, tipo, monto);
    return saved;
  }

  async findAll(userId: string) {
    const rows: {
      id: string;
      comercio: string | null;
      categoria: string;
      descripcion: string | null;
      fecha: Date;
      monto: string;
      tipo: string;
      moneda: string;
    }[] = await this.movimientoRepository.manager.query(
      `
      SELECT
        m.id,
        m.comercio,
        COALESCE(c.nombre, 'Sin categoría') AS categoria,
        m.descripcion,
        m.fecha,
        m.monto,
        m.tipo,
        m.moneda
      FROM movimientos m
      LEFT JOIN categorias c ON m.categoria_id = c.id
      WHERE m.usuario_id = $1
      ORDER BY m.fecha DESC, m.creado_en DESC
      `,
      [userId],
    );

    return rows.map((r) => ({ ...r, monto: Number(r.monto) }));
  }

  async findOne(id: string, userId: string) {
    const movimiento = await this.movimientoRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!movimiento) {
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
    }
    return movimiento;
  }

  async remove(id: string, userId: string) {
    const movimiento = await this.findOne(id, userId);
    await this.syncBalance(userId, movimiento.tipo, -Number(movimiento.monto));
    await this.movimientoRepository.remove(movimiento);
    return { message: 'Movimiento eliminado correctamente' };
  }

  async getUltimosMovimientos(userId: string): Promise<{ categoria: string; tipo: string; fecha: Date; monto: number }[]> {
    const rows: { categoria: string; tipo: string; fecha: Date; monto: string }[] =
      await this.movimientoRepository.manager.query(
        `
        SELECT
          COALESCE(c.nombre, 'Sin categoría') AS categoria,
          m.tipo,
          m.fecha,
          m.monto
        FROM movimientos m
        LEFT JOIN categorias c ON m.categoria_id = c.id
        WHERE m.usuario_id = $1
        ORDER BY m.fecha DESC
        LIMIT 5
        `,
        [userId],
      );

    return rows.map((r) => ({ ...r, monto: Number(r.monto) }));
  }

  async getGastosPorMes(userId: string): Promise<{ mes: string; orden: Date; total: number }[]> {
    const rows: { mes: string; orden: Date; total: string }[] =
      await this.movimientoRepository.manager.query(
        `
        SELECT
          TO_CHAR(mes, 'Mon') AS mes,
          mes AS orden,
          COALESCE(SUM(m.monto), 0) AS total
        FROM generate_series(
          DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
          DATE_TRUNC('month', CURRENT_DATE),
          INTERVAL '1 month'
        ) mes
        LEFT JOIN movimientos m
          ON DATE_TRUNC('month', m.fecha) = mes
          AND m.usuario_id = $1
          AND m.tipo = 'egreso'
        GROUP BY mes
        ORDER BY mes
        `,
        [userId],
      );

    return rows.map((r) => ({ mes: r.mes, orden: r.orden, total: Number(r.total) }));
  }

  async getGastosMensuales(userId: string): Promise<{ mes: Date; label: string; total: number }[]> {
    const rows: { mes: Date; label: string; total: string }[] =
      await this.movimientoRepository.manager.query(
        `
        SELECT
          mes,
          TO_CHAR(mes, 'Mon YYYY') AS label,
          total
        FROM (
          SELECT
            gs.mes,
            COALESCE(SUM(m.monto), 0) AS total
          FROM generate_series(
            DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
            DATE_TRUNC('month', CURRENT_DATE),
            INTERVAL '1 month'
          ) AS gs(mes)
          LEFT JOIN movimientos m
            ON DATE_TRUNC('month', m.fecha) = gs.mes
            AND m.usuario_id = $1
            AND m.tipo = 'egreso'
          GROUP BY gs.mes
        ) t
        ORDER BY t.mes DESC
        `,
        [userId],
      );

    return rows.map((r) => ({ mes: r.mes, label: r.label, total: Number(r.total) }));
  }
}
