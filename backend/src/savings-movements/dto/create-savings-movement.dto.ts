import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateSavingsMovementDto {
  @IsUUID()
  goalId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsIn(['deposito', 'retiro'])
  @IsOptional()
  tipo?: 'deposito' | 'retiro';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  movementDate?: string;
}
