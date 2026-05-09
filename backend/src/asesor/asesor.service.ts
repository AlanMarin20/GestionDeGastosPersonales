import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

type OrdenClientes = 'riesgo' | 'nombre' | 'ingreso';

@Injectable()
export class AsesorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getClientesAsignados(advisorId: string, orden: OrdenClientes = 'riesgo') {
    let orderClause: string;
    switch (orden) {
      case 'nombre':
        orderClause = 'u.nombre_completo ASC';
        break;
      case 'ingreso':
        orderClause = 'b.ingreso DESC NULLS LAST';
        break;
      case 'riesgo':
      default:
        orderClause = 'riesgo DESC';
        break;
    }

    const rows: {
      id: string;
      nombre_completo: string;
      ingreso: string | null;
      egreso: string | null;
      riesgo: string;
    }[] = await this.userRepository.manager.query(
      `
      SELECT
        u.id,
        u.nombre_completo,
        b.ingreso,
        b.egreso,
        CASE
          WHEN b.ingreso > 0 THEN b.egreso / b.ingreso
          ELSE 0
        END AS riesgo
      FROM usuarios u
      LEFT JOIN balances b ON b.usuario_id = u.id
      WHERE u.asesor_id = $1
      ORDER BY ${orderClause}
      `,
      [advisorId],
    );

    return rows.map((r) => ({
      id: r.id,
      nombreCompleto: r.nombre_completo,
      ingreso: r.ingreso !== null ? Number(r.ingreso) : null,
      egreso: r.egreso !== null ? Number(r.egreso) : null,
      riesgo: Number(r.riesgo),
    }));
  }

  async getDetalleCliente(clienteId: string, advisorId: string) {
    const rows: {
      id: string;
      nombre_completo: string;
      email: string;
      riesgo: string;
      saldo_actual_mes: string;
      gastos_mes: string;
      presupuesto_total: string;
      total_ahorrado: string;
    }[] = await this.userRepository.manager.query(
      `
      SELECT
        u.id,
        u.nombre_completo,
        u.email,
        CASE
          WHEN b.ingreso > 0 THEN b.egreso / b.ingreso
          ELSE 0
        END AS riesgo,
        COALESCE((
          SELECT SUM(m.monto) FROM movimientos m
          WHERE m.usuario_id = u.id AND m.tipo = 'ingreso'
            AND m.fecha >= DATE_TRUNC('month', CURRENT_DATE)
        ), 0)
        -
        COALESCE((
          SELECT SUM(m.monto) FROM movimientos m
          WHERE m.usuario_id = u.id AND m.tipo = 'egreso'
            AND m.fecha >= DATE_TRUNC('month', CURRENT_DATE)
        ), 0) AS saldo_actual_mes,
        COALESCE((
          SELECT SUM(m.monto) FROM movimientos m
          WHERE m.usuario_id = u.id AND m.tipo = 'egreso'
            AND m.fecha >= DATE_TRUNC('month', CURRENT_DATE)
        ), 0) AS gastos_mes,
        COALESCE((
          SELECT SUM(p.monto_limite) FROM presupuestos p
          WHERE p.usuario_id = u.id
            AND p.mes = EXTRACT(MONTH FROM CURRENT_DATE)
            AND p.anio = EXTRACT(YEAR FROM CURRENT_DATE)
        ), 0) AS presupuesto_total,
        COALESCE(b.ahorro, 0) AS total_ahorrado
      FROM usuarios u
      LEFT JOIN balances b ON b.usuario_id = u.id
      WHERE u.id = $1
        AND u.asesor_id = $2
      `,
      [clienteId, advisorId],
    );

    if (!rows.length) {
      throw new NotFoundException('Cliente no encontrado o no pertenece a este asesor');
    }

    const r = rows[0];
    return {
      id: r.id,
      nombreCompleto: r.nombre_completo,
      email: r.email,
      riesgo: Number(r.riesgo),
      saldoActualMes: Number(r.saldo_actual_mes),
      gastosMes: Number(r.gastos_mes),
      presupuestoTotal: Number(r.presupuesto_total),
      totalAhorrado: Number(r.total_ahorrado),
    };
  }

  async vincularCliente(advisorId: string, codigoVinculacion: string) {
    const result: { rowCount: number } = await this.userRepository.manager.query(
      `
      UPDATE usuarios
      SET asesor_id = $1,
          codigo_vinculacion = NULL,
          codigo_expira_en = NULL
      WHERE codigo_vinculacion = $2
        AND codigo_expira_en > NOW()
        AND asesor_id IS NULL
      `,
      [advisorId, codigoVinculacion],
    );

    if (result.rowCount === 0) {
      throw new BadRequestException('Código inválido, expirado o cliente ya asignado a un asesor');
    }

    return { message: 'Cliente vinculado correctamente' };
  }

  async desvincularCliente(clienteId: string, advisorId: string) {
    const result: { rowCount: number } = await this.userRepository.manager.query(
      `
      UPDATE usuarios
      SET asesor_id = NULL
      WHERE id = $1
        AND asesor_id = $2
      `,
      [clienteId, advisorId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Cliente no encontrado o no pertenece a este asesor');
    }

    return { message: 'Cliente desvinculado correctamente' };
  }
}
