import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsInt()
  @Min(1)
  categoryId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amountLimit: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  @Max(3000)
  year: number;
}
