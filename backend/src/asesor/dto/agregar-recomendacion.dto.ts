import { IsOptional, IsString, Length } from 'class-validator';

export class AgregarRecomendacionDto {
  @IsString()
  @Length(1, 2000)
  contenido: string;

  @IsOptional()
  @IsString()
  tipo?: string;
}
