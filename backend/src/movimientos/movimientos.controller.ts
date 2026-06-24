import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateMovimientoDto) {
    return this.movimientosService.create(req.user.sub, dto);
  }

  @Get('ultimos')
  getUltimosMovimientos(@Request() req) {
    return this.movimientosService.getUltimosMovimientos(req.user.sub);
  }

  @Get('gastos-por-mes')
  getGastosPorMes(@Request() req) {
    return this.movimientosService.getGastosPorMes(req.user.sub);
  }

  @Get('grafico-categorias')
  getGraficoCategorias(
    @Request() req,
    @Query('periodo') periodo?: string,
  ) {
    return this.movimientosService.getGraficoCategorias(req.user.sub, periodo);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('tipo') tipo?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('periodo') periodo?: string,
    @Query('limit') limit?: number,
    @Query('all') all?: string,
  ) {
    return this.movimientosService.findAll(req.user.sub, {
      search,
      tipo,
      fechaDesde,
      fechaHasta,
      periodo,
      limit: limit ? Number(limit) : undefined,
      all: all === 'true',
    });
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.movimientosService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateMovimientoDto,
  ) {
    return this.movimientosService.update(id, req.user.sub, dto);
  }

  @Delete('clear-all')
  clearAll(@Request() req) {
    return this.movimientosService.removeAll(req.user.sub);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.movimientosService.remove(id, req.user.sub);
  }
}
