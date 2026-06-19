import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { Budget } from '../budgets/entities/budget.entity';
import { MovimientosService } from '../movimientos/movimientos.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('ExpensesService', () => {
  let service: ExpensesService;

  const mockExpenseRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockBudgetRepository = {
    findOne: jest.fn(),
  };

  const mockMovimientosService = {
    registrar: jest.fn(),
    eliminar: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpenseRepository,
        },
        { provide: getRepositoryToken(Budget), useValue: mockBudgetRepository },
        { provide: MovimientosService, useValue: mockMovimientosService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
