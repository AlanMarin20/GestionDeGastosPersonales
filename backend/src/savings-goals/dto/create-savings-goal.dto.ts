import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSavingsGoalDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  targetAmount: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  currentAmount?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
