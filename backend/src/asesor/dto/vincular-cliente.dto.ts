import { IsString, Length } from 'class-validator';

export class VincularClienteDto {
  @IsString()
  @Length(1, 20)
  codigoVinculacion: string;
}
