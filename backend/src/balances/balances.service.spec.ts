import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { Balance } from './entities/balance.entity';
import { MovimientosService } from '../movimientos/movimientos.service';

const USER_ID = 'user-uuid';
const ADVISOR_ID = 'advisor-uuid';

describe('BalancesService', () => {
  let service: BalancesService;
  let mockQuery: jest.Mock;
  let mockFindOne: jest.Mock;
  let mockFind: jest.Mock;
  let mockGetGastosMensuales: jest.Mock;

  beforeEach(async () => {
    mockQuery = jest.fn();
    mockFindOne = jest.fn();
    mockFind = jest.fn();
    mockGetGastosMensuales = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalancesService,
        {
          provide: getRepositoryToken(Balance),
          useValue: {
            manager: { query: mockQuery },
            findOne: mockFindOne,
            find: mockFind,
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: MovimientosService,
          useValue: { getGastosMensuales: mockGetGastosMensuales },
        },
      ],
    }).compile();

    service = module.get<BalancesService>(BalancesService);
  });

  // ─── getResumenAsesor ─────────────────────────────────────────────────────

  describe('getResumenAsesor', () => {
    it('retorna los contadores mapeados como números', async () => {
      mockQuery.mockResolvedValue([
        {
          clientes_asignados: '10',
          riesgo_medio: '3',
          riesgo_alto: '1',
        },
      ]);

      const result = await service.getResumenAsesor(ADVISOR_ID);

      expect(result).toEqual({
        clientesAsignados: 10,
        riesgoMedio: 3,
        riesgoAlto: 1,
      });
    });

    it('retorna ceros cuando el asesor no tiene clientes', async () => {
      mockQuery.mockResolvedValue([
        {
          clientes_asignados: '0',
          riesgo_medio: '0',
          riesgo_alto: '0',
        },
      ]);

      const result = await service.getResumenAsesor(ADVISOR_ID);

      expect(result.clientesAsignados).toBe(0);
      expect(result.riesgoMedio).toBe(0);
      expect(result.riesgoAlto).toBe(0);
    });

    it('pasa el advisorId como parámetro SQL', async () => {
      mockQuery.mockResolvedValue([
        { clientes_asignados: '0', riesgo_medio: '0', riesgo_alto: '0' },
      ]);

      await service.getResumenAsesor(ADVISOR_ID);

      expect(mockQuery.mock.calls[0][1]).toEqual([ADVISOR_ID]);
    });

    it('los valores de riesgo_alto son menores o iguales que clientes_asignados', async () => {
      mockQuery.mockResolvedValue([
        {
          clientes_asignados: '8',
          riesgo_medio: '2',
          riesgo_alto: '5',
        },
      ]);

      const result = await service.getResumenAsesor(ADVISOR_ID);
      expect(result.riesgoAlto).toBeLessThanOrEqual(result.clientesAsignados);
    });
  });

  // ─── getDashboard ─────────────────────────────────────────────────────────

  describe('getDashboard', () => {
    it('retorna las tarjetas con los valores calculados desde movimientos y metas', async () => {
      // 1ª query: stats mensuales (egreso, ingreso)
      // 2ª query: neto disponible
      // 3ª query: ahorro acumulado desde metas_ahorro
      mockQuery
        .mockResolvedValueOnce([{ egreso: '30000', ingreso: '100000' }])
        .mockResolvedValueOnce([{ neto: '70000' }])
        .mockResolvedValueOnce([{ total: '15000' }]);

      const result = await service.getDashboard(USER_ID);

      expect(result).toEqual({
        gastoMensual: 30000,
        dineroDisponible: 70000,
        ingreso: 100000,
        ahorroAcumulado: 15000,
      });
    });

    it('retorna ceros cuando no hay movimientos ni metas', async () => {
      mockQuery
        .mockResolvedValueOnce([{ egreso: '0', ingreso: '0' }])
        .mockResolvedValueOnce([{ neto: '0' }])
        .mockResolvedValueOnce([{ total: '0' }]);

      const result = await service.getDashboard(USER_ID);

      expect(result).toEqual({
        gastoMensual: 0,
        dineroDisponible: 0,
        ingreso: 0,
        ahorroAcumulado: 0,
      });
    });

    it('pasa userId a las tres queries SQL', async () => {
      mockQuery
        .mockResolvedValueOnce([{ egreso: '0', ingreso: '0' }])
        .mockResolvedValueOnce([{ neto: '0' }])
        .mockResolvedValueOnce([{ total: '0' }]);

      await service.getDashboard(USER_ID);

      expect(mockQuery.mock.calls[0][1]).toEqual([USER_ID]);
      expect(mockQuery.mock.calls[1][1]).toEqual([USER_ID]);
      expect(mockQuery.mock.calls[2][1]).toEqual([USER_ID]);
    });

    it('verifica que el gasto y el ingreso mensual filtren únicamente por el mes actual y no sean transferencias internas', async () => {
      mockQuery
        .mockResolvedValueOnce([{ egreso: '12000', ingreso: '45000' }])
        .mockResolvedValueOnce([{ neto: '33000' }])
        .mockResolvedValueOnce([{ total: '5000' }]);

      await service.getDashboard(USER_ID);

      const statsQuery = mockQuery.mock.calls[0][0];
      expect(statsQuery).toContain(
        "DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)",
      );
      expect(statsQuery).toContain('es_transferencia_interna = FALSE');
      expect(statsQuery).toContain("tipo = 'egreso'");
      expect(statsQuery).toContain("tipo = 'ingreso'");
    });

    it('verifica que el dinero disponible calcule el balance neto acumulado global de la cuenta y permita valores negativos', async () => {
      mockQuery
        .mockResolvedValueOnce([{ egreso: '20000', ingreso: '30000' }])
        .mockResolvedValueOnce([{ neto: '-5000' }]) // balance negativo
        .mockResolvedValueOnce([{ total: '0' }]);

      const result = await service.getDashboard(USER_ID);

      expect(result.dineroDisponible).toBe(-5000);

      const netQuery = mockQuery.mock.calls[1][0];
      expect(netQuery).not.toContain("DATE_TRUNC('month'"); // balance neto global, sin limite de mes
      expect(netQuery).toContain(
        "COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) -",
      );
      expect(netQuery).toContain(
        "COALESCE(SUM(CASE WHEN tipo = 'egreso'  THEN monto ELSE 0 END), 0) AS neto",
      );
    });
  });

  // ─── getGraficoGastos ─────────────────────────────────────────────────────

  describe('getGraficoGastos', () => {
    const meses = [
      { mes: new Date('2026-05-01'), label: 'May 2026', total: 30000 },
    ];

    it('calcula el porcentaje correctamente', async () => {
      mockQuery.mockResolvedValueOnce([{ ingreso: '100000', egreso: '75000' }]);
      mockGetGastosMensuales.mockResolvedValue(meses);

      const result = await service.getGraficoGastos(USER_ID);

      expect(result.porcentaje).toBe(75);
      expect(result.meses).toEqual(meses);
    });

    it('retorna porcentaje 0 cuando ingreso es 0 (evita división por cero)', async () => {
      mockQuery.mockResolvedValueOnce([{ ingreso: '0', egreso: '0' }]);
      mockGetGastosMensuales.mockResolvedValue([]);

      const result = await service.getGraficoGastos(USER_ID);
      expect(result.porcentaje).toBe(0);
    });

    it('retorna porcentaje 0 cuando no hay resultado de query', async () => {
      mockQuery.mockResolvedValueOnce([{ ingreso: '0', egreso: '0' }]);
      mockGetGastosMensuales.mockResolvedValue([]);

      const result = await service.getGraficoGastos(USER_ID);
      expect(result.porcentaje).toBe(0);
    });
  });

  // ─── findCurrentBalance ───────────────────────────────────────────────────

  describe('findCurrentBalance', () => {
    it('retorna el balance cuando existe', async () => {
      const balance = { id: 'bal-1', ingreso: 100000 };
      mockFindOne.mockResolvedValue(balance);

      const result = await service.findCurrentBalance(USER_ID);
      expect(result).toEqual(balance);
    });

    it('lanza NotFoundException cuando no existe', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(service.findCurrentBalance(USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
