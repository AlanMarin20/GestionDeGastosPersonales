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

  async create(requestUserId: string, createDto: CreateRecommendationDto) {
    const recommendation = this.recommendationRepository.create({
      user: { id: createDto.userId ?? requestUserId },
      advisor: createDto.advisorId
        ? ({ id: createDto.advisorId } as Recommendation['advisor'])
        : undefined,
      contenido: createDto.content,
      tipo: createDto.type ?? 'general',
    });

    return await this.recommendationRepository.save(recommendation);
  }

  async findAllForUser(userId: string) {
    return await this.recommendationRepository.find({
      where: { user: { id: userId } },
      relations: { advisor: true },
      order: { createdAt: 'DESC' },
    });
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
}
