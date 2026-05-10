import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMovimientoDto {
  @IsIn(['ingreso', 'egreso'])
  tipo!: 'ingreso' | 'egreso';

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto!: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  moneda?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  comercio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;
}
