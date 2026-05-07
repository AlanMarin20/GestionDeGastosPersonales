import { IsNumber, IsOptional } from 'class-validator';

export class UpdateBalanceDto {
  @IsOptional()
  @IsNumber()
  ingreso?: number;

  @IsOptional()
  @IsNumber()
  egreso?: number;

  @IsOptional()
  @IsNumber()
  ahorro?: number;
}
