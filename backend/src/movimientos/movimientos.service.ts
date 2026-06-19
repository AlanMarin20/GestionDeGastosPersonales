import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Movimiento, TipoMovimiento } from './entities/movimiento.entity';
import { Balance } from '../balances/entities/balance.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  private async getOrCreateBalance(userId: string) {
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

  private async findCategoryByName(
    name: string,
    userId: string,
  ): Promise<Category | undefined> {
    const cat = await this.categoryRepository.findOne({
      where: [
        { name: ILike(name), isDefault: true },
        { name: ILike(name), user: { id: userId } },
      ],
    });
    return cat ?? undefined;
  }

  async create(userId: string, dto: CreateMovimientoDto) {
    const category = dto.categoria
      ? await this.findCategoryByName(dto.categoria, userId)
      : undefined;

    const movimiento = this.movimientoRepository.create({
      user: { id: userId },
      tipo: dto.tipo,
      monto: dto.monto,
      moneda: dto.moneda ?? 'ARS',
      comercio: dto.comercio,
      descripcion: dto.descripcion,
      fecha: dto.fecha ? new Date(dto.fecha) : undefined,
      category,
    });
    await this.getOrCreateBalance(userId);
    const saved = await this.movimientoRepository.save(movimiento);

    if (dto.tagIds?.length) {
      const tags = await this.tagRepository
        .createQueryBuilder('t')
        .where('t.id IN (:...ids)', { ids: dto.tagIds })
        .andWhere('t.user.id = :userId', { userId })
        .getMany();
      saved.etiquetas = tags;
      return await this.movimientoRepository.save(saved);
    }

    return saved;
  }

  async update(id: string, userId: string, dto: UpdateMovimientoDto) {
    const existing = await this.movimientoRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['category', 'etiquetas'],
    });
    if (!existing)
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);

    let category = existing.category;
    if (dto.categoria !== undefined) {
      if (dto.categoria) {
        let found = await this.findCategoryByName(dto.categoria, userId);
        if (!found) {
          found = this.categoryRepository.create({
            name: dto.categoria,
            isDefault: false,
            user: { id: userId },
          });
          found = await this.categoryRepository.save(found);
        }
        category = found;
      } else {
        category = undefined;
      }
    }

    Object.assign(existing, {
      tipo: dto.tipo ?? existing.tipo,
      monto: dto.monto ?? existing.monto,
      moneda: dto.moneda ?? existing.moneda,
      comercio: dto.comercio ?? existing.comercio,
      descripcion: dto.descripcion ?? existing.descripcion,
      fecha: dto.fecha ? new Date(dto.fecha) : existing.fecha,
      category,
    });

    if (dto.tagIds !== undefined) {
      if (dto.tagIds.length > 0) {
        const tags = await this.tagRepository
          .createQueryBuilder('t')
          .where('t.id IN (:...ids)', { ids: dto.tagIds })
          .andWhere('t.user.id = :userId', { userId })
          .getMany();
        existing.etiquetas = tags;
      } else {
        existing.etiquetas = [];
      }
    }

    return await this.movimientoRepository.save(existing);
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
    await this.getOrCreateBalance(userId);
    return await this.movimientoRepository.save(movimiento);
  }

  async findAll(userId: string) {
    const rows = await this.movimientoRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.category', 'c')
      .where('m.user.id = :userId', { userId })
      .orderBy('m.fecha', 'DESC')
      .addOrderBy('m.creadoEn', 'DESC')
      .getMany();

    return rows.map((r) => ({
      id: r.id,
      comercio: r.comercio ?? '-',
      categoria: r.category?.name ?? 'Sin categoría',
      descripcion: r.descripcion ?? '',
      fecha: r.fecha,
      monto: Number(r.monto),
      tipo: r.tipo,
      moneda: r.moneda,
      esTransferenciaInterna: r.esTransferenciaInterna,
      etiquetas: (r.etiquetas ?? []).map((e) => ({
        id: e.id,
        nombre: e.nombre,
      })),
    }));
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
    await this.movimientoRepository.remove(movimiento);
    return { message: 'Movimiento eliminado correctamente' };
  }

  async getUltimosMovimientos(userId: string): Promise<
    {
      categoria: string;
      tipo: string;
      fecha: Date;
      monto: number;
      comercio: string;
      descripcion: string;
    }[]
  > {
    const rows: {
      fecha: Date;
      tipo: string;
      monto: string;
      categoria: string;
      comercio: string | null;
      descripcion: string | null;
    }[] = await this.movimientoRepository.manager.query(
      `
        SELECT
          fecha,
          tipo,
          monto,
          comercio,
          descripcion,
          COALESCE(c.nombre, 'Sin categoría') AS categoria
        FROM movimientos
        LEFT JOIN categorias c ON movimientos.categoria_id = c.id
        WHERE usuario_id = $1
        ORDER BY fecha DESC, creado_en DESC
        LIMIT 10
        `,
      [userId],
    );

    return rows.map((r) => ({
      categoria: r.categoria,
      fecha: r.fecha,
      monto: Number(r.monto),
      tipo: r.tipo,
      comercio: r.comercio || '',
      descripcion: r.descripcion || '',
    }));
  }

  async getGastosPorMes(
    userId: string,
  ): Promise<{ mes: string; orden: Date; total: number }[]> {
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
          AND m.es_transferencia_interna = FALSE
        GROUP BY mes
        ORDER BY mes
        `,
        [userId],
      );

    return rows.map((r) => ({
      mes: r.mes,
      orden: r.orden,
      total: Number(r.total),
    }));
  }

  async getGraficoCategorias(userId: string) {
    const rows: { categoria: string; total: string; porcentaje: string }[] =
      await this.movimientoRepository.manager.query(
        `
SELECT categoria, total,

ROUND((total * 100.0) / SUM(total) OVER (), 2) AS porcentaje

FROM (

  SELECT

    COALESCE(c.nombre, 'Sin categoría') AS categoria,

    SUM(m.monto) AS total

  FROM movimientos m

  LEFT JOIN categorias c ON m.categoria_id = c.id

  WHERE m.usuario_id = $1

    AND m.tipo = 'egreso'

  GROUP BY COALESCE(c.nombre, 'Sin categoría')

) t

ORDER BY total DESC;
        `,
        [userId],
      );

    return {
      categorias: rows.map((row) => ({
        categoria: row.categoria,
        total: Number(row.total),
        porcentaje: Number(row.porcentaje),
      })),
    };
  }

  async getGastosMensuales(
    userId: string,
  ): Promise<{ mes: Date; label: string; total: number }[]> {
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
            AND m.es_transferencia_interna = FALSE
          GROUP BY gs.mes
        ) t
        ORDER BY t.mes DESC
        `,
        [userId],
      );

    return rows.map((r) => ({
      mes: r.mes,
      label: r.label,
      total: Number(r.total),
    }));
  }
}
