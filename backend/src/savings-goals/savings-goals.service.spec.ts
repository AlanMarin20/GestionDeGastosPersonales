import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SavingsGoalsService } from './savings-goals.service';
import { SavingsGoal } from './entities/savings-goal.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Balance } from '../balances/entities/balance.entity';

const USER_ID = 'user-uuid';
const GOAL_ID = 'goal-uuid';

describe('SavingsGoalsService', () => {
  let service: SavingsGoalsService;
  
  let mockCreateGoal: jest.Mock;
  let mockSaveGoal: jest.Mock;
  let mockFindOneGoal: jest.Mock;
  let mockRemoveGoal: jest.Mock;
  let mockQueryGoal: jest.Mock;

  let mockCreateMovimiento: jest.Mock;
  let mockSaveMovimiento: jest.Mock;
  let mockQueryMovimiento: jest.Mock;

  let mockFindOneBalance: jest.Mock;
  let mockCreateBalance: jest.Mock;
  let mockSaveBalance: jest.Mock;

  beforeEach(async () => {
    mockCreateGoal = jest.fn();
    mockSaveGoal = jest.fn();
    mockFindOneGoal = jest.fn();
    mockRemoveGoal = jest.fn();
    mockQueryGoal = jest.fn();

    mockCreateMovimiento = jest.fn();
    mockSaveMovimiento = jest.fn();
    mockQueryMovimiento = jest.fn();

    mockFindOneBalance = jest.fn();
    mockCreateBalance = jest.fn();
    mockSaveBalance = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingsGoalsService,
        {
          provide: getRepositoryToken(SavingsGoal),
          useValue: {
            create: mockCreateGoal,
            save: mockSaveGoal,
            findOne: mockFindOneGoal,
            remove: mockRemoveGoal,
            manager: { query: mockQueryGoal },
          },
        },
        {
          provide: getRepositoryToken(Movimiento),
          useValue: {
            create: mockCreateMovimiento,
            save: mockSaveMovimiento,
            manager: { query: mockQueryMovimiento },
          },
        },
        {
          provide: getRepositoryToken(Balance),
          useValue: {
            findOne: mockFindOneBalance,
            create: mockCreateBalance,
            save: mockSaveBalance,
          },
        },
      ],
    }).compile();

    service = module.get<SavingsGoalsService>(SavingsGoalsService);
  });

  describe('create', () => {
    const createDto = {
      name: 'Ahorro para Viaje',
      targetAmount: 5000,
      currentAmount: 1000,
      dueDate: '2026-12-31',
    };

    it('debe lanzar BadRequestException si la meta no es mayor al monto inicial', async () => {
      const invalidDto = {
        ...createDto,
        targetAmount: 1000,
        currentAmount: 1000,
      };

      await expect(service.create(USER_ID, invalidDto)).rejects.toThrow(
        new BadRequestException('La meta debe ser mayor al monto inicial'),
      );
    });

    it('debe lanzar BadRequestException si el monto inicial supera el dinero disponible', async () => {
      // Mock del saldo neto disponible: $500
      mockQueryGoal.mockResolvedValue([{ neto: '500.00' }]);

      await expect(service.create(USER_ID, createDto)).rejects.toThrow(
        new BadRequestException('El monto inicial supera el dinero disponible (500.00)'),
      );
    });

    it('debe descontar correctamente del disponible registrando un egreso si posee suficiente dinero', async () => {
      // Mock de saldo neto disponible de $2000 (suficiente para los $1000 iniciales)
      mockQueryGoal.mockResolvedValue([{ neto: '2000.00' }]);
      mockQueryMovimiento.mockResolvedValue([{ id: 10 }]); // ID de categoría 'ahorro'

      // Mock de balance existente
      mockFindOneBalance.mockResolvedValue({ id: 'balance-uuid', ahorro: 0 });

      const mockGoal = { id: GOAL_ID, ...createDto };
      mockCreateGoal.mockReturnValue(mockGoal);
      mockSaveGoal.mockResolvedValue(mockGoal);

      const mockMovimiento = { id: 'movimiento-uuid', tipo: 'egreso', monto: 1000 };
      mockCreateMovimiento.mockReturnValue(mockMovimiento);
      mockSaveMovimiento.mockResolvedValue(mockMovimiento);

      const result = await service.create(USER_ID, createDto);

      expect(result).toEqual(mockGoal);
      expect(mockCreateGoal).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: createDto.name,
          targetAmount: createDto.targetAmount,
          currentAmount: createDto.currentAmount,
        }),
      );
      expect(mockSaveGoal).toHaveBeenCalled();

      // Verificar que se crea el movimiento de egreso para descontar saldo disponible
      expect(mockCreateMovimiento).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'egreso',
          monto: createDto.currentAmount,
          esTransferenciaInterna: true,
        }),
      );
      expect(mockSaveMovimiento).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debe lanzar NotFoundException si el objetivo de ahorro no existe', async () => {
      mockFindOneGoal.mockResolvedValue(null);

      await expect(service.remove(GOAL_ID, USER_ID)).rejects.toThrow(
        new NotFoundException(`Meta de ahorro con id ${GOAL_ID} no encontrada`),
      );
    });

    it('debe eliminar el ahorro y devolver el monto acumulado al saldo total de la cuenta como un ingreso', async () => {
      const mockGoal = {
        id: GOAL_ID,
        nombre: 'Ahorro para Viaje',
        targetAmount: 5000,
        currentAmount: 1500,
      };
      mockFindOneGoal.mockResolvedValue(mockGoal);

      // Mock de balance existente
      mockFindOneBalance.mockResolvedValue({ id: 'balance-uuid', ahorro: 1500 });
      mockRemoveGoal.mockResolvedValue(mockGoal);

      const mockMovimiento = { id: 'movimiento-uuid', tipo: 'ingreso', monto: 1500 };
      mockCreateMovimiento.mockReturnValue(mockMovimiento);
      mockSaveMovimiento.mockResolvedValue(mockMovimiento);

      const result = await service.remove(GOAL_ID, USER_ID);

      expect(result).toEqual({ message: 'Meta de ahorro eliminada correctamente' });
      expect(mockRemoveGoal).toHaveBeenCalledWith(mockGoal);

      // Verificar que el monto se devuelva como un ingreso
      expect(mockCreateMovimiento).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'ingreso',
          monto: 1500,
          esTransferenciaInterna: true,
        }),
      );
      expect(mockSaveMovimiento).toHaveBeenCalled();
    });
  });
});
