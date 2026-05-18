import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  color?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
