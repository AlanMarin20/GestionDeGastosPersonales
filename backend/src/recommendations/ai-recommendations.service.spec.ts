import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AiRecommendationsService } from './ai-recommendations.service';
import { Recommendation } from './entities/recommendation.entity';
import Groq from 'groq-sdk';

jest.mock('groq-sdk');

const USER_ID = 'user-uuid';

describe('AiRecommendationsService', () => {
  let service: AiRecommendationsService;
  let mockQuery: jest.Mock;
  let mockConfigGet: jest.Mock;
  let mockCreateCompletion: jest.Mock;

  beforeEach(async () => {
    mockQuery = jest.fn();
    mockConfigGet = jest.fn().mockReturnValue('fake-api-key');
    mockCreateCompletion = jest.fn();

    // Mock Groq SDK implementation
    (Groq as unknown as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreateCompletion,
        },
      },
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiRecommendationsService,
        {
          provide: getRepositoryToken(Recommendation),
          useValue: {
            manager: { query: mockQuery },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: mockConfigGet,
          },
        },
      ],
    }).compile();

    service = module.get<AiRecommendationsService>(AiRecommendationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('generateForUser', () => {
    it('debe lanzar un error si GROQ_API_KEY no está configurado', async () => {
      mockConfigGet.mockReturnValue(null);
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AiRecommendationsService,
          {
            provide: getRepositoryToken(Recommendation),
            useValue: {
              manager: { query: mockQuery },
            },
          },
          {
            provide: ConfigService,
            useValue: {
              get: mockConfigGet,
            },
          },
        ],
      }).compile();
      const unconfiguredService = module.get<AiRecommendationsService>(
        AiRecommendationsService,
      );
      await expect(
        unconfiguredService.generateForUser(USER_ID),
      ).rejects.toThrow('GROQ_API_KEY no está configurado.');
    });

    it('debe recopilar el contexto financiero y generar recomendaciones con IA', async () => {
      mockQuery
        // balance
        .mockResolvedValueOnce([
          { ingreso: '150000', egreso: '90000', ahorro: '30000' },
        ])
        // gastosCat
        .mockResolvedValueOnce([
          { categoria: 'Alimentos', total: '40000', porcentaje: '44.4' },
          { categoria: 'Servicios', total: '20000', porcentaje: '22.2' },
        ])
        // presupuestos
        .mockResolvedValueOnce([
          { categoria: 'Alimentos', limite: '30000', gastado: '40000' },
        ])
        // metas
        .mockResolvedValueOnce([
          {
            nombre: 'Fondo de Emergencia',
            objetivo: '100000',
            actual: '30000',
            fecha_limite: new Date('2026-12-31'),
          },
        ])
        // tendencia
        .mockResolvedValueOnce([
          { mes: 'Apr 2026', total: '85000' },
          { mes: 'May 2026', total: '95000' },
          { mes: 'Jun 2026', total: '90000' },
        ]);

      const mockAiResponse = `
        [
          {
            "titulo": "Límite de Alimentos superado",
            "contenido": "Gastaste $40.000 en Alimentos superando tu presupuesto de $30.000. Te sugerimos moderar las compras de delivery.",
            "tipo": "alerta",
            "severidad": "danger",
            "categoria": "Alimentos"
          },
          {
            "titulo": "Buen nivel de ahorro acumulado",
            "contenido": "Llevás ahorrado $30.000 de tu meta Fondo de Emergencia. ¡Seguí así!",
            "tipo": "consejo",
            "severidad": "good",
            "categoria": "Ahorros"
          }
        ]
      `;
      mockCreateCompletion.mockResolvedValue({
        choices: [
          {
            message: {
              content: mockAiResponse,
            },
          },
        ],
      });

      const recommendations = await service.generateForUser(USER_ID);

      expect(mockQuery).toHaveBeenCalledTimes(5);
      expect(mockCreateCompletion).toHaveBeenCalledWith({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: expect.stringContaining(
              'Sos un asesor financiero personal',
            ),
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      expect(recommendations).toHaveLength(2);
      expect(recommendations[0]).toEqual({
        titulo: 'Límite de Alimentos superado',
        contenido:
          'Gastaste $40.000 en Alimentos superando tu presupuesto de $30.000. Te sugerimos moderar las compras de delivery.',
        tipo: 'alerta',
        severidad: 'danger',
        categoria: 'Alimentos',
      });
      expect(recommendations[1].titulo).toBe('Buen nivel de ahorro acumulado');
      expect(recommendations[1].severidad).toBe('good');
    });

    it('debe manejar respuestas de IA inválidas o no legibles retornando un arreglo vacío', async () => {
      mockQuery
        .mockResolvedValueOnce([{ ingreso: '0', egreso: '0', ahorro: '0' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockCreateCompletion.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Este no es un json válido [}',
            },
          },
        ],
      });

      const recommendations = await service.generateForUser(USER_ID);
      expect(recommendations).toEqual([]);
    });
  });
});
