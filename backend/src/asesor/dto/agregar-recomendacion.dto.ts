import { IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class AgregarRecomendacionDto {
  @IsString()
  @Length(1, 2000)
  contenido!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asesor', 'ia'])
  tipo?: string;

  @IsOptional()
  @IsString()
  @IsIn(['danger', 'warning', 'good', 'info'])
  severidad?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria?: string;
}
