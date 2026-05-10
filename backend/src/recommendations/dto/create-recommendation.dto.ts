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
  @MaxLength(200)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsIn(['general', 'alerta', 'consejo'])
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsIn(['danger', 'warning', 'good', 'info'])
  severidad?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria?: string;
}
