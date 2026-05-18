import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { Recommendation } from './entities/recommendation.entity';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
  ) {}

  private mapToFrontend(r: Recommendation) {
    const tipoSevMap: Record<string, string> = {
      alerta: 'danger',
      consejo: 'info',
      general: 'warning',
    };
    const severity = r.severidad || tipoSevMap[r.tipo] || 'info';
    const source = r.advisor ? 'asesor' : 'ia';
    const date = r.createdAt
      ? new Date(r.createdAt).toISOString().slice(0, 7)
      : '';

    return {
      id: r.id,
      title: r.titulo || '',
      body: r.contenido,
      severity,
      source,
      date,
      category: r.categoria || '',
      wasRead: r.wasRead,
    };
  }

  async create(requestUserId: string, createDto: CreateRecommendationDto) {
    const recommendation = this.recommendationRepository.create({
      user: { id: createDto.userId ?? requestUserId },
      advisor: createDto.advisorId
        ? ({ id: createDto.advisorId } as Recommendation['advisor'])
        : undefined,
      contenido: createDto.content,
      titulo: createDto.titulo,
      tipo: createDto.type ?? 'general',
      severidad: createDto.severidad,
      categoria: createDto.categoria,
    });

    return await this.recommendationRepository.save(recommendation);
  }

  async findAllForUser(userId: string) {
    const rows = await this.recommendationRepository.find({
      where: { user: { id: userId } },
      relations: { advisor: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => this.mapToFrontend(r));
  }

  async findAllByAdvisor(advisorId: string) {
    return await this.recommendationRepository.find({
      where: { advisor: { id: advisorId } },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(id: string, userId: string) {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { advisor: true },
    });

    if (!recommendation) {
      throw new NotFoundException(`Recomendación con id ${id} no encontrada`);
    }

    return recommendation;
  }

  async updateForUser(
    id: string,
    userId: string,
    updateDto: UpdateRecommendationDto,
  ) {
    const recommendation = await this.findOneForUser(id, userId);

    if (updateDto.content !== undefined) {
      recommendation.contenido = updateDto.content;
    }
    if (updateDto.type !== undefined) {
      recommendation.tipo = updateDto.type;
    }
    if (updateDto.wasRead !== undefined) {
      recommendation.wasRead = updateDto.wasRead;
    }

    return await this.recommendationRepository.save(recommendation);
  }

  async markAsReadForUser(id: string, userId: string) {
    const recommendation = await this.findOneForUser(id, userId);
    recommendation.wasRead = true;

    return await this.recommendationRepository.save(recommendation);
  }

  async removeForUser(id: string, userId: string) {
    const recommendation = await this.findOneForUser(id, userId);
    await this.recommendationRepository.remove(recommendation);

    return { message: 'Recomendación eliminada correctamente' };
  }

  async getHistoria(
    userId: string,
    emisor?: string,
    mes?: number,
    anio?: number,
  ) {
    const rows: {
      id: string;
      emisor: string;
      titulo: string | null;
      contenido: string;
      severidad: string | null;
      categoria: string | null;
      creado_en: Date;
    }[] = await this.recommendationRepository.manager.query(
      `
      SELECT
        id,
        CASE
          WHEN asesor_id IS NULL THEN 'ia'
          ELSE 'asesor'
        END AS emisor,
        titulo,
        contenido,
        severidad,
        categoria,
        creado_en
      FROM recomendaciones
      WHERE usuario_id = $1
        AND ($2::text IS NULL OR ($2 = 'ia' AND asesor_id IS NULL) OR ($2 = 'asesor' AND asesor_id IS NOT NULL))
        AND ($3::int IS NULL OR EXTRACT(MONTH FROM creado_en) = $3)
        AND ($4::int IS NULL OR EXTRACT(YEAR FROM creado_en) = $4)
      ORDER BY creado_en DESC
      `,
      [userId, emisor ?? null, mes ?? null, anio ?? null],
    );

    const tipoSevMap: Record<string, string> = {
      alerta: 'danger',
      consejo: 'info',
      general: 'warning',
    };

    return rows.map((r) => ({
      id: r.id,
      source: r.emisor,
      title: r.titulo || '',
      body: r.contenido,
      severity: r.severidad || tipoSevMap['general'],
      category: r.categoria || '',
      date: new Date(r.creado_en).toISOString().slice(0, 7),
    }));
  }
}
