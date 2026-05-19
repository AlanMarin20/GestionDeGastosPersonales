import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { AiRecommendationsService } from './ai-recommendations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recommendation])],
  controllers: [RecommendationsController],
  providers: [RecommendationsService, AiRecommendationsService],
})
export class RecommendationsModule {}
