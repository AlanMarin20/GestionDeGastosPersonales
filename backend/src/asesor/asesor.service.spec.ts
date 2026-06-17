import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AsesorService } from './asesor.service';
import { User } from '../users/entities/user.entity';
import { Recommendation } from '../recommendations/entities/recommendation.entity';
import { NotificationsService } from '../notifications/notifications.service';

const ADVISOR_ID = 'advisor-uuid';
const CLIENT_ID = 'client-uuid';

describe('AsesorService', () => {
  let service: AsesorService;
  let mockQuery: jest.Mock;
  let mockCreate: jest.Mock;
  let mockSave: jest.Mock;
  let mockNotificationsCreate: jest.Mock;

  beforeEach(async () => {
    mockQuery = jest.fn();
    mockCreate = jest.fn();
    mockSave = jest.fn();
    mockNotificationsCreate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsesorService,
        {
          provide: getRepositoryToken(User),
          useValue: { manager: { query: mockQuery } },
        },
        {
          provide: getRepositoryToken(Recommendation),
          useValue: { create: mockCreate, save: mockSave },
        },
        {
          provide: NotificationsService,
          useValue: { create: mockNotificationsCreate },
        },
      ],
    }).compile();

    service = module.get<AsesorService>(AsesorService);
  });

  // ─── getClientesAsignados ─────────────────────────────────────────────────

  describe('getClientesAsignados', () => {
    const dbRow = {
      id: CLIENT_ID,
      nombre_completo: 'Ana García',
      ingreso: '100000',
      egreso: '80000',
      ahorro: '15000',
      riesgo: '0.8',
    };

    it('retorna la lista mapeada correctamente', async () => {
      mockQuery.mockResolvedValue([dbRow]);

      const result = await service.getClientesAsignados(ADVISOR_ID);

      expect(result).toEqual([
        {
          id: CLIENT_ID,
          nombreCompleto: 'Ana García',
          ingreso: 100000,
          egreso: 80000,
          ahorro: 15000,
          riesgo: 0.8,
        },
      ]);
    });

    it('convierte ingreso/egreso null a null (cliente sin balance)', async () => {
      mockQuery.mockResolvedValue([
        { ...dbRow, ingreso: null, egreso: null, riesgo: '0' },
      ]);

      const result = await service.getClientesAsignados(ADVISOR_ID);

      expect(result[0].ingreso).toBeNull();
      expect(result[0].egreso).toBeNull();
    });

    it('usa ORDER BY riesgo DESC por defecto', async () => {
      mockQuery.mockResolvedValue([]);
      await service.getClientesAsignados(ADVISOR_ID);
      expect(mockQuery.mock.calls[0][0]).toContain('riesgo DESC');
    });

    it('usa ORDER BY nombre cuando orden = "nombre"', async () => {
      mockQuery.mockResolvedValue([]);
      await service.getClientesAsignados(ADVISOR_ID, 'nombre');
      expect(mockQuery.mock.calls[0][0]).toContain('u.nombre_completo ASC');
    });

    it('usa ORDER BY ingreso cuando orden = "ingreso"', async () => {
      mockQuery.mockResolvedValue([]);
      await service.getClientesAsignados(ADVISOR_ID, 'ingreso');
      expect(mockQuery.mock.calls[0][0]).toContain('b.ingreso DESC NULLS LAST');
    });

    it('pasa el advisorId como parámetro SQL', async () => {
      mockQuery.mockResolvedValue([]);
      await service.getClientesAsignados(ADVISOR_ID);
      expect(mockQuery.mock.calls[0][1]).toEqual([ADVISOR_ID]);
    });
  });

  // ─── getDetalleCliente ────────────────────────────────────────────────────

  describe('getDetalleCliente', () => {
    const dbRow = {
      id: CLIENT_ID,
      nombre_completo: 'Ana García',
      email: 'ana@test.com',
      riesgo: '0.75',
      saldo_actual_mes: '20000',
      gastos_mes: '30000',
      presupuesto_total: '50000',
      total_ahorrado: '120000',
    };

    it('retorna el detalle financiero mapeado', async () => {
      mockQuery.mockResolvedValue([dbRow]);

      const result = await service.getDetalleCliente(CLIENT_ID, ADVISOR_ID);

      expect(result).toEqual({
        id: CLIENT_ID,
        nombreCompleto: 'Ana García',
        email: 'ana@test.com',
        riesgo: 0.75,
        saldoActualMes: 20000,
        gastosMes: 30000,
        presupuestoTotal: 50000,
        totalAhorrado: 120000,
      });
    });

    it('lanza NotFoundException cuando el cliente no existe o no pertenece al asesor', async () => {
      mockQuery.mockResolvedValue([]);

      await expect(
        service.getDetalleCliente(CLIENT_ID, ADVISOR_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getDashboardCliente ──────────────────────────────────────────────────

  describe('getDashboardCliente', () => {
    it('retorna las tarjetas del dashboard correctamente', async () => {
      mockQuery.mockResolvedValue([
        {
          gasto_mensual: '30000',
          dinero_disponible: '70000',
          ingreso: '100000',
          ahorro_acumulado: '15000',
        },
      ]);

      const result = await service.getDashboardCliente(CLIENT_ID, ADVISOR_ID);

      expect(result).toEqual({
        gastoMensual: 30000,
        dineroDisponible: 70000,
        ingreso: 100000,
        ahorroAcumulado: 15000,
      });
    });

    it('lanza NotFoundException cuando no hay filas', async () => {
      mockQuery.mockResolvedValue([]);

      await expect(
        service.getDashboardCliente(CLIENT_ID, ADVISOR_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getUltimosMovimientosCliente ─────────────────────────────────────────

  describe('getUltimosMovimientosCliente', () => {
    const movRow = {
      id: 'mov-1',
      comercio: 'Supermercado',
      categoria: 'Alimentación',
      descripcion: null,
      fecha: new Date('2026-05-01'),
      monto: '5000',
      tipo: 'egreso',
      moneda: 'ARS',
    };

    it('retorna movimientos con monto convertido a number', async () => {
      mockQuery
        .mockResolvedValueOnce([{ exists: true }])
        .mockResolvedValueOnce([movRow]);

      const result = await service.getUltimosMovimientosCliente(
        CLIENT_ID,
        ADVISOR_ID,
      );

      expect(result).toHaveLength(1);
      expect(result[0].monto).toBe(5000);
      expect(typeof result[0].monto).toBe('number');
    });

    it('lanza NotFoundException cuando el cliente no pertenece al asesor', async () => {
      mockQuery.mockResolvedValueOnce([{ exists: false }]);

      await expect(
        service.getUltimosMovimientosCliente(CLIENT_ID, ADVISOR_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('no ejecuta la segunda query si el cliente no existe', async () => {
      mockQuery.mockResolvedValueOnce([{ exists: false }]);

      await expect(
        service.getUltimosMovimientosCliente(CLIENT_ID, ADVISOR_ID),
      ).rejects.toThrow();

      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  // ─── getRecomendacionesEnviadas ───────────────────────────────────────────

  describe('getRecomendacionesEnviadas', () => {
    const recRow = {
      id: 'rec-1',
      titulo: '',
      contenido: 'Reducí gastos en entretenimiento',
      tipo: 'general',
      fueLeida: false,
      creadoEn: new Date('2026-05-01'),
    };

    it('retorna las recomendaciones mapeadas', async () => {
      mockQuery
        .mockResolvedValueOnce([{ exists: true }])
        .mockResolvedValueOnce([recRow]);

      const result = await service.getRecomendacionesEnviadas(
        CLIENT_ID,
        ADVISOR_ID,
      );

      expect(result).toEqual([
        {
          id: 'rec-1',
          titulo: '',
          contenido: 'Reducí gastos en entretenimiento',
          tipo: 'general',
          fueLeida: false,
          creadoEn: recRow.creadoEn,
        },
      ]);
    });

    it('retorna arreglo vacío si no hay recomendaciones', async () => {
      mockQuery
        .mockResolvedValueOnce([{ exists: true }])
        .mockResolvedValueOnce([]);

      const result = await service.getRecomendacionesEnviadas(
        CLIENT_ID,
        ADVISOR_ID,
      );
      expect(result).toEqual([]);
    });

    it('lanza NotFoundException cuando el cliente no pertenece al asesor', async () => {
      mockQuery.mockResolvedValueOnce([{ exists: false }]);

      await expect(
        service.getRecomendacionesEnviadas(CLIENT_ID, ADVISOR_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── agregarRecomendacion ─────────────────────────────────────────────────

  describe('agregarRecomendacion', () => {
    const createdAt = new Date('2026-05-09');

    it('crea y retorna la recomendación y la notificación cuando el cliente existe', async () => {
      mockQuery.mockResolvedValueOnce([{ id: 'rec-new', creado_en: createdAt }]);
      mockNotificationsCreate.mockResolvedValue({});

      const result = await service.agregarRecomendacion(
        CLIENT_ID,
        ADVISOR_ID,
        'Ahorrá más',
        'asesor',
        'Mi Titulo',
      );

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO recomendaciones'),
        [CLIENT_ID, ADVISOR_ID, 'Mi Titulo', 'Ahorrá más', 'asesor'],
      );
      expect(mockNotificationsCreate).toHaveBeenCalledWith(CLIENT_ID, {
        message: 'Nueva recomendación de tu asesor: "Mi Titulo"',
        type: 'info',
      });
      expect(result).toEqual({
        id: 'rec-new',
        titulo: 'Mi Titulo',
        contenido: 'Ahorrá más',
        tipo: 'asesor',
        creadoEn: createdAt,
      });
    });

    it('usa el tipo provisto si se especifica', async () => {
      mockQuery.mockResolvedValueOnce([{ id: 'rec-new', creado_en: createdAt }]);
      mockNotificationsCreate.mockResolvedValue({});

      const result = await service.agregarRecomendacion(
        CLIENT_ID,
        ADVISOR_ID,
        'Ahorrá más',
        'ahorro',
      );
      expect(result.tipo).toBe('ahorro');
    });

    it('lanza NotFoundException si el cliente no pertenece al asesor', async () => {
      mockQuery.mockResolvedValueOnce([]);

      await expect(
        service.agregarRecomendacion(CLIENT_ID, ADVISOR_ID, 'contenido'),
      ).rejects.toThrow(NotFoundException);

      expect(mockNotificationsCreate).not.toHaveBeenCalled();
    });
  });

  // ─── getGraficoCategorias ─────────────────────────────────────────────────

  describe('getGraficoCategorias', () => {
    it('retorna porcentaje y categorías mapeadas', async () => {
      mockQuery
        .mockResolvedValueOnce([{ porcentaje_gastado: '75.50' }])
        .mockResolvedValueOnce([
          { categoria: 'Alimentación', total: '15000', porcentaje: '60.00' },
          { categoria: 'Transporte', total: '10000', porcentaje: '40.00' },
        ]);

      const result = await service.getGraficoCategorias(CLIENT_ID, ADVISOR_ID);

      expect(result.porcentaje).toBe(75.5);
      expect(result.categorias).toHaveLength(2);
      expect(result.categorias[0]).toEqual({
        categoria: 'Alimentación',
        total: 15000,
        porcentaje: 60,
      });
    });

    it('retorna categorías vacías si no hay egresos', async () => {
      mockQuery
        .mockResolvedValueOnce([{ porcentaje_gastado: '0' }])
        .mockResolvedValueOnce([]);

      const result = await service.getGraficoCategorias(CLIENT_ID, ADVISOR_ID);

      expect(result.porcentaje).toBe(0);
      expect(result.categorias).toEqual([]);
    });

    it('lanza NotFoundException si el cliente no existe o no tiene balance', async () => {
      mockQuery.mockResolvedValueOnce([]);

      await expect(
        service.getGraficoCategorias(CLIENT_ID, ADVISOR_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getGastosPorMes ──────────────────────────────────────────────────────

  describe('getGastosPorMes', () => {
    it('retorna 12 meses mapeados con total numérico', async () => {
      const months = Array.from({ length: 12 }, (_, i) => ({
        mes_label: `Month ${i + 1}`,
        total: String(i * 1000),
      }));
      mockQuery.mockResolvedValue(months);

      const result = await service.getGastosPorMes(CLIENT_ID, ADVISOR_ID);

      expect(result).toHaveLength(12);
      expect(typeof result[0].total).toBe('number');
      expect(result[0]).toHaveProperty('mes');
    });

    it('convierte meses sin movimientos a total 0', async () => {
      mockQuery.mockResolvedValue([{ mes_label: 'Jun 2025', total: '0' }]);

      const result = await service.getGastosPorMes(CLIENT_ID, ADVISOR_ID);
      expect(result[0].total).toBe(0);
    });
  });

  // ─── vincularCliente ──────────────────────────────────────────────────────

  describe('vincularCliente', () => {
    it('retorna mensaje de éxito cuando el código es válido', async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      const result = await service.vincularCliente(ADVISOR_ID, 'CODIGO123');
      expect(result).toEqual({ message: 'Cliente vinculado correctamente' });
    });

    it('lanza BadRequestException cuando el código es inválido o expirado', async () => {
      mockQuery.mockResolvedValue({ rowCount: 0 });

      await expect(
        service.vincularCliente(ADVISOR_ID, 'INVALIDO'),
      ).rejects.toThrow(BadRequestException);
    });

    it('pasa el advisorId y el código como parámetros SQL', async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      await service.vincularCliente(ADVISOR_ID, 'ABC123');
      expect(mockQuery.mock.calls[0][1]).toEqual([ADVISOR_ID, 'ABC123']);
    });
  });

  // ─── desvincularCliente ───────────────────────────────────────────────────

  describe('desvincularCliente', () => {
    it('retorna mensaje de éxito cuando se desvincula correctamente', async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      const result = await service.desvincularCliente(CLIENT_ID, ADVISOR_ID);
      expect(result).toEqual({ message: 'Cliente desvinculado correctamente' });
    });

    it('lanza NotFoundException cuando el cliente no pertenece al asesor', async () => {
      mockQuery.mockResolvedValue({ rowCount: 0 });

      await expect(
        service.desvincularCliente(CLIENT_ID, ADVISOR_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('pasa clienteId y advisorId como parámetros SQL', async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      await service.desvincularCliente(CLIENT_ID, ADVISOR_ID);
      expect(mockQuery.mock.calls[0][1]).toEqual([CLIENT_ID, ADVISOR_ID]);
    });
  });
});
