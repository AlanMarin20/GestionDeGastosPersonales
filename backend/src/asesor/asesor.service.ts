import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Recommendation } from '../recommendations/entities/recommendation.entity';

type OrdenClientes = 'riesgo' | 'nombre' | 'ingreso';

@Injectable()
export class AsesorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
  ) {}

  async getClientesAsignados(
    advisorId: string,
    orden: OrdenClientes = 'riesgo',
  ) {
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
      ahorro: string | null;
      riesgo: string;
    }[] = await this.userRepository.manager.query(
      `
      SELECT
        u.id,
        u.nombre_completo,
        b.ingreso,
        b.egreso,
        b.ahorro,
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
      ahorro: r.ahorro !== null ? Number(r.ahorro) : null,
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
      throw new NotFoundException(
        'Cliente no encontrado o no pertenece a este asesor',
      );
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

  async getGraficoCategorias(clienteId: string, advisorId: string) {
    const [porcentajeRow]: { porcentaje_gastado: string }[] =
      await this.userRepository.manager.query(
        `
        SELECT
          CASE
            WHEN b.ingreso > 0
            THEN ROUND((b.egreso / b.ingreso) * 100, 2)
            ELSE 0
          END AS porcentaje_gastado
        FROM balances b
        JOIN usuarios u ON u.id = b.usuario_id
        WHERE u.id = $1
          AND u.asesor_id = $2
        `,
        [clienteId, advisorId],
      );

    if (!porcentajeRow) {
      throw new NotFoundException(
        'Cliente no encontrado o no pertenece a este asesor',
      );
    }

    const categorias: {
      categoria: string;
      total: string;
      porcentaje: string;
    }[] = await this.userRepository.manager.query(
      `
        SELECT categoria, total,
          ROUND((total * 100.0) / SUM(total) OVER (), 2) AS porcentaje
        FROM (
          SELECT
            COALESCE(c.nombre, 'Sin categoría') AS categoria,
            SUM(m.monto) AS total
          FROM movimientos m
          JOIN usuarios u ON u.id = m.usuario_id
          LEFT JOIN categorias c ON m.categoria_id = c.id
          WHERE m.usuario_id = $1
            AND u.asesor_id = $2
            AND m.tipo = 'egreso'
          GROUP BY COALESCE(c.nombre, 'Sin categoría')
        ) t
        ORDER BY total DESC
        `,
      [clienteId, advisorId],
    );

    return {
      porcentaje: Number(porcentajeRow.porcentaje_gastado),
      categorias: categorias.map((c) => ({
        categoria: c.categoria,
        total: Number(c.total),
        porcentaje: Number(c.porcentaje),
      })),
    };
  }

  async getGastosPorMes(clienteId: string, advisorId: string) {
    const rows: { mes_label: string; total: string }[] =
      await this.userRepository.manager.query(
        `
        SELECT
          TO_CHAR(mes, 'Mon YYYY') AS mes_label,
          total
        FROM (
          SELECT
            mes,
            COALESCE(SUM(m.monto), 0) AS total
          FROM generate_series(
            DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months',
            DATE_TRUNC('month', CURRENT_DATE),
            INTERVAL '1 month'
          ) AS mes
          LEFT JOIN movimientos m
            ON DATE_TRUNC('month', m.fecha) = mes
            AND m.usuario_id = $1
            AND m.tipo = 'egreso'
            AND EXISTS (
              SELECT 1 FROM usuarios u
              WHERE u.id = m.usuario_id
                AND u.asesor_id = $2
            )
          GROUP BY mes
        ) t
        ORDER BY t.mes DESC
        `,
        [clienteId, advisorId],
      );

    return rows.map((r) => ({ mes: r.mes_label, total: Number(r.total) }));
  }

  async getDashboardCliente(clienteId: string, advisorId: string) {
    const rows: {
      gasto_mensual: string;
      dinero_disponible: string;
      ingreso: string;
      ahorro_acumulado: string;
    }[] = await this.userRepository.manager.query(
      `
      SELECT
        COALESCE(b.egreso, 0)              AS gasto_mensual,
        COALESCE(b.ingreso - b.egreso, 0)  AS dinero_disponible,
        COALESCE(b.ingreso, 0)             AS ingreso,
        COALESCE(b.ahorro, 0)              AS ahorro_acumulado
      FROM usuarios u
      LEFT JOIN balances b ON b.usuario_id = u.id
      WHERE u.id = $1
        AND u.asesor_id = $2
      `,
      [clienteId, advisorId],
    );

    if (!rows.length) {
      throw new NotFoundException(
        'Cliente no encontrado o no pertenece a este asesor',
      );
    }

    const r = rows[0];
    return {
      gastoMensual: Number(r.gasto_mensual),
      dineroDisponible: Number(r.dinero_disponible),
      ingreso: Number(r.ingreso),
      ahorroAcumulado: Number(r.ahorro_acumulado),
    };
  }

  async getUltimosMovimientosCliente(clienteId: string, advisorId: string) {
    const exists: { exists: boolean }[] =
      await this.userRepository.manager.query(
        `SELECT EXISTS (
         SELECT 1 FROM usuarios WHERE id = $1 AND asesor_id = $2
       ) AS exists`,
        [clienteId, advisorId],
      );

    if (!exists[0]?.exists) {
      throw new NotFoundException(
        'Cliente no encontrado o no pertenece a este asesor',
      );
    }

    const rows: {
      id: string;
      comercio: string | null;
      categoria: string;
      descripcion: string | null;
      fecha: Date;
      monto: string;
      tipo: string;
      moneda: string;
    }[] = await this.userRepository.manager.query(
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
      LIMIT 5
      `,
      [clienteId],
    );

    return rows.map((r) => ({ ...r, monto: Number(r.monto) }));
  }

  async getRecomendacionesEnviadas(clienteId: string, advisorId: string) {
    // Obtener últimas 2 recomendaciones sin filtrar por tipo
    const rows: any[] = await this.userRepository.manager.query(
      `
        SELECT 
          titulo,
          contenido,
          tipo,
          creado_en as "creadoEn"
        FROM recomendaciones
        WHERE usuario_id = $1
        ORDER BY creado_en DESC
        LIMIT 2
        `,
      [clienteId],
    );

    return rows.map((r) => ({
      titulo: r.titulo || '',
      contenido: r.contenido,
      tipo: r.tipo,
      creadoEn: r.creadoEn,
    }));
  }

  async getRecomendacionesHistoricas(clienteId: string, advisorId: string) {
    // Obtener todas las recomendaciones sin límite
    const rows: any[] = await this.userRepository.manager.query(
      `
        SELECT 
          titulo,
          contenido,
          tipo,
          creado_en as "creadoEn"
        FROM recomendaciones
        WHERE usuario_id = $1
        ORDER BY creado_en DESC
        `,
      [clienteId],
    );

    return rows.map((r) => ({
      titulo: r.titulo || '',
      contenido: r.contenido,
      tipo: r.tipo,
      creadoEn: r.creadoEn,
    }));
  }

  async agregarRecomendacion(
    clienteId: string,
    advisorId: string,
    contenido: string,
    tipo = 'asesor',
    titulo?: string,
  ) {
    // SQL directo: INSERT INTO recomendaciones
    // SELECT u.id, advisorId, titulo, contenido, tipo
    // FROM usuarios u
    // WHERE u.id = clienteId AND u.asesor_id = advisorId
    const result = await this.userRepository.manager.query(
      `
      INSERT INTO recomendaciones (usuario_id, asesor_id, titulo, contenido, tipo)
      SELECT u.id, $2, $3, $4, $5
      FROM usuarios u
      WHERE u.id = $1 AND u.asesor_id = $2
      RETURNING id, creado_en
      `,
      [clienteId, advisorId, titulo || '', contenido, tipo],
    );

    if (!result || result.length === 0) {
      throw new NotFoundException(
        'Cliente no encontrado o no pertenece a este asesor',
      );
    }

    return {
      id: result[0].id,
      titulo: titulo || '',
      contenido,
      tipo,
      creadoEn: result[0].creado_en,
    };
  }

  async vincularCliente(advisorId: string, codigoVinculacion: string) {
    const result: { rowCount: number } =
      await this.userRepository.manager.query(
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
      throw new BadRequestException(
        'Código inválido, expirado o cliente ya asignado a un asesor',
      );
    }

    return { message: 'Cliente vinculado correctamente' };
  }

  async getAllRecomendacionesEnviadas(advisorId: string) {
    const rows: {
      id: string;
      titulo: string;
      contenido: string;
      tipo: string;
      creado_en: Date;
      nombre_completo: string;
      usuario_id: string;
    }[] = await this.userRepository.manager.query(
      `
      SELECT r.id, r.titulo, r.contenido, r.tipo, r.creado_en,
             u.nombre_completo, r.usuario_id
      FROM recomendaciones r
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.asesor_id = $1
      ORDER BY r.creado_en DESC
      LIMIT 100
      `,
      [advisorId],
    );

    return rows.map((r) => ({
      id: r.id,
      titulo: r.titulo || '',
      contenido: r.contenido,
      tipo: r.tipo,
      creadoEn: r.creado_en,
      clienteNombre: r.nombre_completo,
      clienteId: r.usuario_id,
    }));
  }

  async desvincularCliente(clienteId: string, advisorId: string) {
    const result: { rowCount: number } =
      await this.userRepository.manager.query(
        `
      UPDATE usuarios
      SET asesor_id = NULL
      WHERE id = $1
        AND asesor_id = $2
      `,
        [clienteId, advisorId],
      );

    if (result.rowCount === 0) {
      throw new NotFoundException(
        'Cliente no encontrado o no pertenece a este asesor',
      );
    }

    return { message: 'Cliente desvinculado correctamente' };
  }
}
