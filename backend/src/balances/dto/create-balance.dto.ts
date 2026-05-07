import { IsNumber } from 'class-validator';

export class CreateBalanceDto {
  @IsNumber()
  ingreso: number;

  @IsNumber()
  egreso: number;

  @IsNumber()
  ahorro: number;
}
