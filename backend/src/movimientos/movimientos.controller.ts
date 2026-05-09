import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateMovimientoDto) {
    return this.movimientosService.create(req.user.sub, dto);
  }

  @Get('gastos-por-mes')
  getGastosPorMes(@Request() req) {
    return this.movimientosService.getGastosPorMes(req.user.sub);
  }

  @Get()
  findAll(@Request() req) {
    return this.movimientosService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.movimientosService.findOne(id, req.user.sub);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.movimientosService.remove(id, req.user.sub);
  }
}
