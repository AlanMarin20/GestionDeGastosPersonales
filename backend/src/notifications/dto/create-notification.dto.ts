import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsIn(['info', 'warning', 'success', 'error'])
  type?: string;
}
