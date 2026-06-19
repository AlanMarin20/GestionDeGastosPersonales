import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovimientosService } from './movimientos.service';
import { Movimiento } from './entities/movimiento.entity';
import { Balance } from '../balances/entities/balance.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';

const USER_ID = 'user-uuid';

describe('MovimientosService', () => {
  let service: MovimientosService;
  let mockQuery: jest.Mock;

  beforeEach(async () => {
    mockQuery = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimientosService,
        {
          provide: getRepositoryToken(Movimiento),
          useValue: {
            manager: { query: mockQuery },
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Balance),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MovimientosService>(MovimientosService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ─── getUltimosMovimientos (Transacciones recientes) ──────────────────────
  describe('getUltimosMovimientos', () => {
    it('debe consultar y retornar las últimas 5 transacciones formateadas', async () => {
      const mockRows = [
        {
          categoria: 'Alimentos',
          tipo: 'egreso',
          fecha: new Date('2026-06-17'),
          monto: '1500.50',
        },
        {
          categoria: 'Servicios',
          tipo: 'egreso',
          fecha: new Date('2026-06-16'),
          monto: '2400.00',
        },
        {
          categoria: 'Sin categoría',
          tipo: 'ingreso',
          fecha: new Date('2026-06-15'),
          monto: '10000.00',
        },
      ];
      mockQuery.mockResolvedValue(mockRows);

      const result = await service.getUltimosMovimientos(USER_ID);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 10'),
        [USER_ID],
      );
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        categoria: 'Alimentos',
        tipo: 'egreso',
        fecha: expect.any(Date),
        monto: 1500.5,
        comercio: '',
        descripcion: '',
      });
      expect(result[2].monto).toBe(10000.0);
    });
  });

  // ─── getGastosPorMes (Gráficos) ──────────────────────────────────────────
  describe('getGastosPorMes', () => {
    it('debe retornar los gastos acumulados de los últimos 6 meses excluyendo transferencias internas', async () => {
      const mockRows = [
        { mes: 'Jan', orden: new Date('2026-01-01'), total: '0' },
        { mes: 'Feb', orden: new Date('2026-02-01'), total: '12000' },
        { mes: 'Mar', orden: new Date('2026-03-01'), total: '15500' },
        { mes: 'Apr', orden: new Date('2026-04-01'), total: '9800' },
        { mes: 'May', orden: new Date('2026-05-01'), total: '22000' },
        { mes: 'Jun', orden: new Date('2026-06-01'), total: '14300' },
      ];
      mockQuery.mockResolvedValue(mockRows);

      const result = await service.getGastosPorMes(USER_ID);

      expect(mockQuery).toHaveBeenCalled();
      const sqlQuery = mockQuery.mock.calls[0][0];
      expect(sqlQuery).toContain("INTERVAL '5 months'");
      expect(sqlQuery).toContain("m.tipo = 'egreso'");
      expect(sqlQuery).toContain('m.es_transferencia_interna = FALSE');

      expect(result).toHaveLength(6);
      expect(result[1]).toEqual({
        mes: 'Feb',
        orden: expect.any(Date),
        total: 12000,
      });
    });
  });

  // ─── getGastosMensuales (Gráficos detallados) ─────────────────────────────
  describe('getGastosMensuales', () => {
    it('debe retornar la serie mensual con formato de etiqueta y fecha correspondiente', async () => {
      const mockRows = [
        { mes: new Date('2026-06-01'), label: 'Jun 2026', total: '14300' },
        { mes: new Date('2026-05-01'), label: 'May 2026', total: '22000' },
      ];
      mockQuery.mockResolvedValue(mockRows);

      const result = await service.getGastosMensuales(USER_ID);

      expect(mockQuery).toHaveBeenCalled();
      const sqlQuery = mockQuery.mock.calls[0][0];
      expect(sqlQuery).toContain("TO_CHAR(mes, 'Mon YYYY') AS label");
      expect(sqlQuery).toContain('ORDER BY t.mes DESC');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        mes: expect.any(Date),
        label: 'Jun 2026',
        total: 14300,
      });
    });
  });
});
