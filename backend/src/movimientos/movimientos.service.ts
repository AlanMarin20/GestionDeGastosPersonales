import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimiento, TipoMovimiento } from './entities/movimiento.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
  ) {}

  async create(userId: string, dto: CreateMovimientoDto) {
    const movimiento = this.movimientoRepository.create({
      user: { id: userId },
      tipo: dto.tipo,
      monto: dto.monto,
      moneda: dto.moneda ?? 'ARS',
      descripcion: dto.descripcion,
      fecha: dto.fecha ? new Date(dto.fecha) : undefined,
    });
    return await this.movimientoRepository.save(movimiento);
  }

  async registrar(
    userId: string,
    tipo: TipoMovimiento,
    monto: number,
    descripcion?: string,
    moneda = 'ARS',
    fecha?: Date,
  ) {
    const movimiento = this.movimientoRepository.create({
      user: { id: userId },
      tipo,
      monto,
      moneda,
      descripcion,
      fecha,
    });
    return await this.movimientoRepository.save(movimiento);
  }

  async findAll(userId: string) {
    return await this.movimientoRepository.find({
      where: { user: { id: userId } },
      order: { fecha: 'DESC', creadoEn: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const movimiento = await this.movimientoRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!movimiento) {
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
    }
    return movimiento;
  }

  async remove(id: string, userId: string) {
    const movimiento = await this.findOne(id, userId);
    await this.movimientoRepository.remove(movimiento);
    return { message: 'Movimiento eliminado correctamente' };
  }
}
