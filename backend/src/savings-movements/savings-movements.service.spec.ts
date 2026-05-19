import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SavingsMovementsService } from './savings-movements.service';
import { SavingsMovement } from './entities/savings-movement.entity';
import { SavingsGoal } from '../savings-goals/entities/savings-goal.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Balance } from '../balances/entities/balance.entity';
import { NotificationsService } from '../notifications/notifications.service';

const USER_ID = 'user-uuid';
const GOAL_ID = 'goal-uuid';

function makeGoal(overrides: Partial<SavingsGoal> = {}): SavingsGoal {
  return {
    id: GOAL_ID,
    nombre: 'Vacaciones',
    targetAmount: 10000,
    currentAmount: 2000,
    isActive: true,
    user: { id: USER_ID } as any,
    ...overrides,
  } as SavingsGoal;
}

describe('SavingsMovementsService', () => {
  let service: SavingsMovementsService;
  let mockMovimientoCreate: jest.Mock;
  let mockMovimientoSave: jest.Mock;
  let mockMovimientoQuery: jest.Mock;
  let mockGoalFindOne: jest.Mock;
  let mockGoalSave: jest.Mock;
  let mockMovementCreate: jest.Mock;
  let mockMovementSave: jest.Mock;
  let mockBalanceFindOne: jest.Mock;
  let mockBalanceSave: jest.Mock;
  let mockBalanceCreate: jest.Mock;
  let mockNotificationsCreate: jest.Mock;

  beforeEach(async () => {
    mockMovimientoCreate = jest.fn((dto) => dto);
    mockMovimientoSave = jest.fn(async (m) => m);
    mockMovimientoQuery = jest.fn();
    mockGoalFindOne = jest.fn();
    mockGoalSave = jest.fn(async (g) => g);
    mockMovementCreate = jest.fn((dto) => dto);
    mockMovementSave = jest.fn(async (m) => ({ id: 'movement-uuid', ...m }));
    mockBalanceFindOne = jest.fn(async () => ({ id: 'bal-1' }));
    mockBalanceSave = jest.fn(async (b) => b);
    mockBalanceCreate = jest.fn((b) => b);
    mockNotificationsCreate = jest.fn(async () => ({}));

    // Categoría ahorro: devuelve vacío para simplificar (sin categoría)
    mockMovimientoQuery.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingsMovementsService,
        {
          provide: getRepositoryToken(Movimiento),
          useValue: {
            create: mockMovimientoCreate,
            save: mockMovimientoSave,
            manager: { query: mockMovimientoQuery },
          },
        },
        {
          provide: getRepositoryToken(SavingsGoal),
          useValue: {
            findOne: mockGoalFindOne,
            save: mockGoalSave,
          },
        },
        {
          provide: getRepositoryToken(SavingsMovement),
          useValue: {
            create: mockMovementCreate,
            save: mockMovementSave,
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Balance),
          useValue: {
            findOne: mockBalanceFindOne,
            create: mockBalanceCreate,
            save: mockBalanceSave,
          },
        },
        {
          provide: NotificationsService,
          useValue: { create: mockNotificationsCreate },
        },
      ],
    }).compile();

    service = module.get<SavingsMovementsService>(SavingsMovementsService);
  });

  // ─── Casos de error ─────────────────────────────────────────────────────────

  describe('create — errores', () => {
    it('lanza NotFoundException si la meta no existe', async () => {
      mockGoalFindOne.mockResolvedValue(null);

      await expect(
        service.create(USER_ID, { goalId: GOAL_ID, amount: 500 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el depósito supera el dinero disponible', async () => {
      mockGoalFindOne.mockResolvedValue(makeGoal());
      // La primera query del flujo deposito es el neto disponible
      mockMovimientoQuery.mockResolvedValueOnce([{ neto: '300' }]);

      await expect(
        service.create(USER_ID, { goalId: GOAL_ID, amount: 500, tipo: 'deposito' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el retiro supera el saldo del objetivo', async () => {
      mockGoalFindOne.mockResolvedValue(makeGoal({ currentAmount: 100 }));

      await expect(
        service.create(USER_ID, { goalId: GOAL_ID, amount: 500, tipo: 'retiro' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── Depósito ────────────────────────────────────────────────────────────────

  describe('create — depósito', () => {
    beforeEach(() => {
      mockGoalFindOne.mockResolvedValue(makeGoal({ currentAmount: 2000 }));
      // Primera query en flujo deposito: neto disponible
      // Segunda query: findCategoriaAhorroId → vacío (sin categoría)
      mockMovimientoQuery
        .mockResolvedValueOnce([{ neto: '5000' }])
        .mockResolvedValueOnce([]);
    });

    it('crea un movimiento de tipo egreso', async () => {
      await service.create(USER_ID, { goalId: GOAL_ID, amount: 500, tipo: 'deposito' });

      expect(mockMovimientoCreate).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'egreso', monto: 500 }),
      );
    });

    it('el movimiento tiene esTransferenciaInterna = true', async () => {
      await service.create(USER_ID, { goalId: GOAL_ID, amount: 500, tipo: 'deposito' });

      expect(mockMovimientoCreate).toHaveBeenCalledWith(
        expect.objectContaining({ esTransferenciaInterna: true }),
      );
    });

    it('incrementa currentAmount del objetivo por el monto depositado', async () => {
      await service.create(USER_ID, { goalId: GOAL_ID, amount: 500, tipo: 'deposito' });

      const savedGoal = mockGoalSave.mock.calls[0][0];
      expect(Number(savedGoal.currentAmount)).toBe(2500);
    });

    it('el monto del movimiento egreso es exactamente el monto depositado', async () => {
      await service.create(USER_ID, { goalId: GOAL_ID, amount: 750, tipo: 'deposito' });

      // Reset mocks for this test
      expect(mockMovimientoCreate).toHaveBeenCalledWith(
        expect.objectContaining({ monto: 750 }),
      );
    });

    it('guarda el movimiento en movimientos_ahorro', async () => {
      await service.create(USER_ID, { goalId: GOAL_ID, amount: 500, tipo: 'deposito' });

      expect(mockMovementSave).toHaveBeenCalled();
    });
  });

  // ─── Retiro ──────────────────────────────────────────────────────────────────

  describe('create — retiro', () => {
    beforeEach(() => {
      mockGoalFindOne.mockResolvedValue(makeGoal({ currentAmount: 3000 }));
      mockMovimientoQuery.mockResolvedValue([]); // findCategoriaAhorroId (no se llama en retiro pero por si acaso)
    });

    it('crea un movimiento de tipo ingreso', async () => {
      await service.create(USER_ID, { goalId: GOAL_ID, amount: 500, tipo: 'retiro' });

      expect(mockMovimientoCreate).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'ingreso', monto: 500 }),
      );
    });

    it('el movimiento tiene esTransferenciaInterna = true', async () => {
      await service.create(USER_ID, { goalId: GOAL_ID, amount: 500, tipo: 'retiro' });

      expect(mockMovimientoCreate).toHaveBeenCalledWith(
        expect.objectContaining({ esTransferenciaInterna: true }),
      );
    });

    it('decrementa currentAmount del objetivo por el monto retirado', async () => {
      await service.create(USER_ID, { goalId: GOAL_ID, amount: 500, tipo: 'retiro' });

      const savedGoal = mockGoalSave.mock.calls[0][0];
      expect(Number(savedGoal.currentAmount)).toBe(2500);
    });

    it('currentAmount no baja de cero', async () => {
      mockGoalFindOne.mockResolvedValue(makeGoal({ currentAmount: 300 }));

      await service.create(USER_ID, { goalId: GOAL_ID, amount: 300, tipo: 'retiro' });

      const savedGoal = mockGoalSave.mock.calls[0][0];
      expect(Number(savedGoal.currentAmount)).toBeGreaterThanOrEqual(0);
    });

    it('guarda el movimiento en movimientos_ahorro', async () => {
      await service.create(USER_ID, { goalId: GOAL_ID, amount: 500, tipo: 'retiro' });

      expect(mockMovementSave).toHaveBeenCalled();
    });
  });

  // ─── Flujo de dinero ─────────────────────────────────────────────────────────

  describe('flujo de dinero', () => {
    it('depósito: el monto debitado del movimiento == monto acreditado al objetivo', async () => {
      const initialAmount = 1000;
      const depositAmount = 400;
      mockGoalFindOne.mockResolvedValue(makeGoal({ currentAmount: initialAmount }));
      mockMovimientoQuery
        .mockResolvedValueOnce([{ neto: '10000' }])
        .mockResolvedValueOnce([]);

      await service.create(USER_ID, { goalId: GOAL_ID, amount: depositAmount, tipo: 'deposito' });

      const movimientoArg = mockMovimientoCreate.mock.calls[0][0];
      const goalArg = mockGoalSave.mock.calls[0][0];

      expect(movimientoArg.tipo).toBe('egreso');
      expect(Number(movimientoArg.monto)).toBe(depositAmount);
      expect(Number(goalArg.currentAmount)).toBe(initialAmount + depositAmount);
    });

    it('retiro: el monto acreditado del movimiento == monto debitado del objetivo', async () => {
      const initialAmount = 2000;
      const withdrawAmount = 600;
      mockGoalFindOne.mockResolvedValue(makeGoal({ currentAmount: initialAmount }));
      mockMovimientoQuery.mockResolvedValue([]);

      await service.create(USER_ID, { goalId: GOAL_ID, amount: withdrawAmount, tipo: 'retiro' });

      const movimientoArg = mockMovimientoCreate.mock.calls[0][0];
      const goalArg = mockGoalSave.mock.calls[0][0];

      expect(movimientoArg.tipo).toBe('ingreso');
      expect(Number(movimientoArg.monto)).toBe(withdrawAmount);
      expect(Number(goalArg.currentAmount)).toBe(initialAmount - withdrawAmount);
    });
  });
});
