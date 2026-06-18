import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { Recommendation } from './entities/recommendation.entity';
import { AiRecommendationsService } from './ai-recommendations.service';

const USER_ID = 'user-uuid';
const ADVISOR_ID = 'advisor-uuid';
const REC_ID = 'rec-uuid';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let mockQuery: jest.Mock;
  let mockFind: jest.Mock;
  let mockFindOne: jest.Mock;
  let mockCreate: jest.Mock;
  let mockSave: jest.Mock;
  let mockRemove: jest.Mock;
  let mockGenerateForUser: jest.Mock;

  beforeEach(async () => {
    mockQuery = jest.fn();
    mockFind = jest.fn();
    mockFindOne = jest.fn();
    mockCreate = jest.fn();
    mockSave = jest.fn();
    mockRemove = jest.fn();
    mockGenerateForUser = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: getRepositoryToken(Recommendation),
          useValue: {
            manager: { query: mockQuery },
            find: mockFind,
            findOne: mockFindOne,
            create: mockCreate,
            save: mockSave,
            remove: mockRemove,
          },
        },
        {
          provide: AiRecommendationsService,
          useValue: {
            generateForUser: mockGenerateForUser,
          },
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
  });

  // ─── getHistoria ──────────────────────────────────────────────────────────

  describe('getHistoria', () => {
    const iaRow = {
      emisor: 'ia',
      contenido: 'Recomendación de la IA',
      creado_en: new Date('2026-05-01'),
    };
    const asesorRow = {
      emisor: 'asesor',
      contenido: 'Recomendación del asesor',
      creado_en: new Date('2026-04-15'),
    };

    it('retorna todas las recomendaciones sin filtros', async () => {
      mockQuery.mockResolvedValue([iaRow, asesorRow]);

      const result = await service.getHistoria(USER_ID);

      expect(result).toHaveLength(2);
      expect(result[0].source).toBe('ia');
      expect(result[1].source).toBe('asesor');
    });

    it('pasa null para filtros no proporcionados', async () => {
      mockQuery.mockResolvedValue([]);

      await service.getHistoria(USER_ID);

      const params = mockQuery.mock.calls[0][1];
      expect(params).toEqual([USER_ID, null, null, null]);
    });

    it('pasa el emisor cuando se especifica', async () => {
      mockQuery.mockResolvedValue([iaRow]);

      await service.getHistoria(USER_ID, 'ia');

      const params = mockQuery.mock.calls[0][1];
      expect(params[1]).toBe('ia');
    });

    it('pasa mes y año cuando se especifican', async () => {
      mockQuery.mockResolvedValue([]);

      await service.getHistoria(USER_ID, undefined, 5, 2026);

      const params = mockQuery.mock.calls[0][1];
      expect(params[2]).toBe(5);
      expect(params[3]).toBe(2026);
    });

    it('pasa todos los filtros juntos', async () => {
      mockQuery.mockResolvedValue([asesorRow]);

      await service.getHistoria(USER_ID, 'asesor', 4, 2026);

      const params = mockQuery.mock.calls[0][1];
      expect(params).toEqual([USER_ID, 'asesor', 4, 2026]);
    });

    it('retorna arreglo vacío cuando no hay coincidencias', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await service.getHistoria(USER_ID, 'ia', 1, 2020);
      expect(result).toEqual([]);
    });

    it('incluye el userId en la query SQL', async () => {
      mockQuery.mockResolvedValue([]);

      await service.getHistoria(USER_ID);

      const params = mockQuery.mock.calls[0][1];
      expect(params[0]).toBe(USER_ID);
    });
  });

  // ─── findAllForUser ───────────────────────────────────────────────────────

  describe('findAllForUser', () => {
    it('retorna las recomendaciones del usuario mapeadas', async () => {
      const rows = [
        {
          id: REC_ID,
          creado_en: new Date('2026-05-15'),
          tipo: 'alerta',
          severidad: 'danger',
          titulo: 'Test Alerta',
          contenido: 'Test Content',
          asesor_id: 'advisor-uuid',
        },
      ];
      mockQuery.mockResolvedValue(rows);

      const result = await service.findAllForUser(USER_ID);
      expect(result).toEqual([
        {
          id: REC_ID,
          title: '',
          body: 'Test',
          severity: 'info',
          source: 'ia',
          date: '',
          category: '',
          wasRead: undefined,
        },
      ]);
      expect(mockFind).toHaveBeenCalledWith({
        where: { user: { id: USER_ID } },
        relations: { advisor: true },
        order: { createdAt: 'DESC' },
      });
    });
  });

  // ─── findOneForUser ───────────────────────────────────────────────────────

  describe('findOneForUser', () => {
    it('retorna la recomendación cuando existe', async () => {
      const rec = { id: REC_ID, contenido: 'Test' };
      mockFindOne.mockResolvedValue(rec);

      const result = await service.findOneForUser(REC_ID, USER_ID);
      expect(result).toEqual(rec);
    });

    it('lanza NotFoundException cuando no existe', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(service.findOneForUser(REC_ID, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── markAsReadForUser ────────────────────────────────────────────────────

  describe('markAsReadForUser', () => {
    it('marca la recomendación como leída', async () => {
      const rec = { id: REC_ID, contenido: 'Test', wasRead: false };
      mockFindOne.mockResolvedValue(rec);
      mockSave.mockResolvedValue({ ...rec, wasRead: true });

      const result = await service.markAsReadForUser(REC_ID, USER_ID);

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({ wasRead: true }),
      );
      expect(result.wasRead).toBe(true);
    });
  });

  // ─── removeForUser ────────────────────────────────────────────────────────

  describe('removeForUser', () => {
    it('elimina la recomendación y retorna mensaje', async () => {
      const rec = { id: REC_ID, contenido: 'Test' };
      mockFindOne.mockResolvedValue(rec);
      mockRemove.mockResolvedValue(rec);

      const result = await service.removeForUser(REC_ID, USER_ID);

      expect(mockRemove).toHaveBeenCalledWith(rec);
      expect(result).toEqual({
        message: 'Recomendación eliminada correctamente',
      });
    });

    it('lanza NotFoundException si no existe', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(service.removeForUser(REC_ID, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── generateAiRecommendations ────────────────────────────────────────────

  describe('generateAiRecommendations', () => {
    it('debe generar recomendaciones con IA y guardarlas en base de datos', async () => {
      const mockRawRecs = [
        {
          titulo: 'Ahorra más',
          contenido: 'Contenido test',
          tipo: 'consejo',
          severidad: 'info',
          categoria: 'Ahorros',
        },
      ];
      mockGenerateForUser.mockResolvedValue(mockRawRecs);

      const mockSavedRec = {
        id: 'rec-1',
        titulo: 'Ahorra más',
        contenido: 'Contenido test',
        tipo: 'consejo',
        severidad: 'info',
        categoria: 'Ahorros',
        createdAt: new Date(),
        wasRead: false,
      };
      mockCreate.mockReturnValue(mockSavedRec);
      mockSave.mockResolvedValue(mockSavedRec);

      const result = await service.generateAiRecommendations(USER_ID);

      expect(mockGenerateForUser).toHaveBeenCalledWith(USER_ID);
      expect(mockCreate).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Ahorra más');
    });
  });
});
