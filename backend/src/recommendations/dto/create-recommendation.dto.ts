import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateRecommendationDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  advisorId?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsIn(['general', 'alerta', 'consejo'])
  type?: string;
}
