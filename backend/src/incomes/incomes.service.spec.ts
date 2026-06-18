import { Test, TestingModule } from '@nestjs/testing';
import { IncomesService } from './incomes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Income } from './entities/income.entity';
import { MovimientosService } from '../movimientos/movimientos.service';

describe('IncomesService', () => {
  let service: IncomesService;

  const mockIncomeRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockMovimientosService = {
    registrar: jest.fn(),
    eliminar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncomesService,
        { provide: getRepositoryToken(Income), useValue: mockIncomeRepository },
        { provide: MovimientosService, useValue: mockMovimientosService },
      ],
    }).compile();

    service = module.get<IncomesService>(IncomesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

