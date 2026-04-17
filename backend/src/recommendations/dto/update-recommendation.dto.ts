import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateRecommendationDto } from './create-recommendation.dto';

export class UpdateRecommendationDto extends PartialType(
  CreateRecommendationDto,
) {
  @IsOptional()
  @IsBoolean()
  wasRead?: boolean;
}
