import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { Recommendation } from './entities/recommendation.entity';

interface AiRecommendationRaw {
  titulo: string;
  contenido: string;
  tipo: 'consejo' | 'alerta' | 'general';
  severidad: 'danger' | 'warning' | 'good' | 'info';
  categoria: string;
}

@Injectable()
export class AiRecommendationsService {
  private readonly logger = new Logger(AiRecommendationsService.name);
  private readonly genai: GoogleGenAI | null;

  constructor(
    @InjectRepository(Recommendation)
    private readonly recRepository: Repository<Recommendation>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genai = apiKey?.trim()
      ? new GoogleGenAI({ apiKey: apiKey.trim() })
      : null;
  }

  async generateForUser(userId: string): Promise<AiRecommendationRaw[]> {
    if (!this.genai) {
      throw new Error('GEMINI_API_KEY no está configurado.');
    }

    const context = await this.gatherFinancialContext(userId);
    const prompt = this.buildPrompt(context);

    const response = await this.genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const raw = response.text ?? '';
    return this.parseResponse(raw);
  }

  private async gatherFinancialContext(userId: string) {
    const manager = this.recRepository.manager;

    const [balance]: { ingreso: string; egreso: string; ahorro: string }[] =
      await manager.query(
        `SELECT COALESCE(ingreso,0) AS ingreso,
                COALESCE(egreso,0) AS egreso,
                COALESCE(ahorro,0) AS ahorro
         FROM balances WHERE usuario_id = $1`,
        [userId],
      );

    const gastosCat: { categoria: string; total: string; porcentaje: string }[] =
      await manager.query(
        `SELECT
           COALESCE(c.nombre, 'Sin categoría') AS categoria,
           SUM(m.monto) AS total,
           ROUND(SUM(m.monto) * 100.0 / NULLIF(SUM(SUM(m.monto)) OVER (), 0), 1) AS porcentaje
         FROM movimientos m
         LEFT JOIN categorias c ON m.categoria_id = c.id
         WHERE m.usuario_id = $1
           AND m.tipo = 'egreso'
           AND m.es_transferencia_interna = FALSE
           AND DATE_TRUNC('month', m.fecha) = DATE_TRUNC('month', CURRENT_DATE)
         GROUP BY COALESCE(c.nombre, 'Sin categoría')
         ORDER BY total DESC
         LIMIT 8`,
        [userId],
      );

    const presupuestos: {
      categoria: string;
      limite: string;
      gastado: string;
    }[] = await manager.query(
      `SELECT
         c.nombre AS categoria,
         p.monto_limite AS limite,
         COALESCE(
           (SELECT SUM(m.monto) FROM movimientos m
            WHERE m.usuario_id = p.usuario_id
              AND m.categoria_id = p.categoria_id
              AND m.tipo = 'egreso'
              AND m.es_transferencia_interna = FALSE
              AND EXTRACT(MONTH FROM m.fecha) = p.mes
              AND EXTRACT(YEAR FROM m.fecha) = p.anio),
         0) AS gastado
       FROM presupuestos p
       JOIN categorias c ON p.categoria_id = c.id
       WHERE p.usuario_id = $1
         AND p.mes = EXTRACT(MONTH FROM CURRENT_DATE)
         AND p.anio = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [userId],
    );

    const metas: {
      nombre: string;
      objetivo: string;
      actual: string;
      fecha_limite: Date | null;
    }[] = await manager.query(
      `SELECT nombre, monto_objetivo AS objetivo, monto_actual AS actual, fecha_limite
       FROM metas_ahorro
       WHERE usuario_id = $1 AND esta_activa = TRUE`,
      [userId],
    );

    const tendencia: { mes: string; total: string }[] = await manager.query(
      `SELECT TO_CHAR(gs.mes, 'Mon YYYY') AS mes,
              COALESCE(SUM(m.monto), 0) AS total
       FROM generate_series(
         DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months',
         DATE_TRUNC('month', CURRENT_DATE),
         INTERVAL '1 month'
       ) AS gs(mes)
       LEFT JOIN movimientos m
         ON DATE_TRUNC('month', m.fecha) = gs.mes
         AND m.usuario_id = $1
         AND m.tipo = 'egreso'
         AND m.es_transferencia_interna = FALSE
       GROUP BY gs.mes
       ORDER BY gs.mes`,
      [userId],
    );

    return { balance, gastosCat, presupuestos, metas, tendencia };
  }

  private buildPrompt(ctx: Awaited<ReturnType<typeof this.gatherFinancialContext>>) {
    const { balance, gastosCat, presupuestos, metas, tendencia } = ctx;

    const ing = Number(balance?.ingreso ?? 0);
    const eg = Number(balance?.egreso ?? 0);
    const ah = Number(balance?.ahorro ?? 0);
    const pct = ing > 0 ? ((eg / ing) * 100).toFixed(1) : '—';

    const fmt = (n: number) =>
      n.toLocaleString('es-AR', { minimumFractionDigits: 2 });

    const gastosBlock = gastosCat.length
      ? gastosCat
          .map(
            (g, i) =>
              `${i + 1}. ${g.categoria}: $${fmt(Number(g.total))} (${g.porcentaje}%)`,
          )
          .join('\n')
      : 'Sin gastos registrados este mes.';

    const presBlock = presupuestos.length
      ? presupuestos
          .map((p) => {
            const lim = Number(p.limite);
            const gas = Number(p.gastado);
            const pctP = lim > 0 ? ((gas / lim) * 100).toFixed(0) : '—';
            const estado = gas > lim ? '⚠ SUPERADO' : 'En orden';
            return `- ${p.categoria}: $${fmt(gas)} gastado de $${fmt(lim)} (${pctP}%) — ${estado}`;
          })
          .join('\n')
      : 'Sin presupuestos configurados.';

    const metasBlock = metas.length
      ? metas
          .map((m) => {
            const obj = Number(m.objetivo);
            const act = Number(m.actual);
            const pctM = obj > 0 ? ((act / obj) * 100).toFixed(0) : '—';
            const venc = m.fecha_limite
              ? ` (vence: ${new Date(m.fecha_limite).toLocaleDateString('es-AR')})`
              : '';
            return `- "${m.nombre}": $${fmt(act)} de $${fmt(obj)} (${pctM}%)${venc}`;
          })
          .join('\n')
      : 'Sin metas de ahorro activas.';

    const tendBlock = tendencia
      .map((t) => `- ${t.mes}: $${fmt(Number(t.total))}`)
      .join('\n');

    return `Sos un asesor financiero personal para una app de gestión de gastos en Argentina.
Analizá los siguientes datos financieros del usuario y generá entre 3 y 5 recomendaciones personalizadas y accionables.

=== RESUMEN FINANCIERO ACUMULADO ===
Ingreso total: $${fmt(ing)}
Egreso total: $${fmt(eg)}
Ahorro total: $${fmt(ah)}
Ratio gasto/ingreso: ${pct}%

=== GASTOS POR CATEGORÍA (MES ACTUAL) ===
${gastosBlock}

=== ESTADO DE PRESUPUESTOS (MES ACTUAL) ===
${presBlock}

=== METAS DE AHORRO ACTIVAS ===
${metasBlock}

=== TENDENCIA ÚLTIMOS 3 MESES ===
${tendBlock}

Respondé ÚNICAMENTE con un array JSON válido, sin texto adicional ni bloques de código. Cada objeto debe tener exactamente estos campos:
{
  "titulo": "título conciso (máximo 60 caracteres)",
  "contenido": "explicación detallada y accionable con datos concretos (máximo 280 caracteres)",
  "tipo": "consejo" | "alerta" | "general",
  "severidad": "danger" | "warning" | "good" | "info",
  "categoria": "nombre de categoría relevante (ej: Alimentos, Transporte, Ahorros, Habitos, Presupuesto, Entretenimiento, Salud)"
}

Reglas:
- Usá "danger" solo si hay un problema crítico (presupuesto superado >50%, ratio gasto/ingreso >90%).
- Usá "warning" para situaciones que requieren atención.
- Usá "good" para logros o comportamientos positivos del usuario.
- Usá "info" para sugerencias de mejora o consejos generales.
- Sé específico: mencioná montos y porcentajes reales del usuario.
- Escribí en español rioplatense informal pero profesional.`;
  }

  private parseResponse(raw: string): AiRecommendationRaw[] {
    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start === -1 || end === -1) {
      this.logger.warn('Respuesta de Gemini sin array JSON válido');
      return [];
    }

    try {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      if (!Array.isArray(parsed)) return [];
      return parsed.slice(0, 5).filter(
        (r) =>
          typeof r.titulo === 'string' && typeof r.contenido === 'string',
      );
    } catch (err) {
      this.logger.error('Error parseando respuesta de Gemini', err);
      return [];
    }
  }
}
