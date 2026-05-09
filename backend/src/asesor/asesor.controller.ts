import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AsesorService } from './asesor.service';
import { VincularClienteDto } from './dto/vincular-cliente.dto';

@UseGuards(AuthGuard)
@Controller('asesor')
export class AsesorController {
  constructor(private readonly asesorService: AsesorService) {}

  @Get('clientes')
  getClientes(
    @Request() req,
    @Query('orden') orden?: 'riesgo' | 'nombre' | 'ingreso',
  ) {
    return this.asesorService.getClientesAsignados(req.user.sub, orden);
  }

  @Get('clientes/:id')
  getDetalleCliente(@Request() req, @Param('id') id: string) {
    return this.asesorService.getDetalleCliente(id, req.user.sub);
  }

  @Post('clientes')
  vincularCliente(@Request() req, @Body() dto: VincularClienteDto) {
    return this.asesorService.vincularCliente(req.user.sub, dto.codigoVinculacion);
  }

  @Delete('clientes/:id')
  desvincularCliente(@Request() req, @Param('id') id: string) {
    return this.asesorService.desvincularCliente(id, req.user.sub);
  }
}
