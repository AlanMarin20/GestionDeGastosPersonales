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
import { AgregarRecomendacionDto } from './dto/agregar-recomendacion.dto';

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

  @Get('clientes/:id/dashboard')
  getDashboardCliente(@Request() req, @Param('id') id: string) {
    return this.asesorService.getDashboardCliente(id, req.user.sub);
  }

  @Get('clientes/:id/ultimos-movimientos')
  getUltimosMovimientos(@Request() req, @Param('id') id: string) {
    return this.asesorService.getUltimosMovimientosCliente(id, req.user.sub);
  }

  @Get('clientes/:id/recomendaciones')
  getRecomendaciones(@Request() req, @Param('id') id: string) {
    return this.asesorService.getRecomendacionesEnviadas(id, req.user.sub);
  }

  @Post('clientes/:id/recomendaciones')
  agregarRecomendacion(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AgregarRecomendacionDto,
  ) {
    return this.asesorService.agregarRecomendacion(id, req.user.sub, dto.contenido, dto.tipo);
  }

  @Get('clientes/:id/gastos-por-mes')
  getGastosPorMes(@Request() req, @Param('id') id: string) {
    return this.asesorService.getGastosPorMes(id, req.user.sub);
  }

  @Get('clientes/:id/grafico-categorias')
  getGraficoCategorias(@Request() req, @Param('id') id: string) {
    return this.asesorService.getGraficoCategorias(id, req.user.sub);
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
