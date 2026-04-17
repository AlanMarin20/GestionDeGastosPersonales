import { PartialType } from '@nestjs/mapped-types';
import { CreateSavingsMovementDto } from './create-savings-movement.dto';

export class UpdateSavingsMovementDto extends PartialType(
  CreateSavingsMovementDto,
) {}
