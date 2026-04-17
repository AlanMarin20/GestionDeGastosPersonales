import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateUserRoleDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(1)
  roleId: number;
}
