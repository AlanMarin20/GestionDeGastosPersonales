import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = this.roleRepository.create({
        nombre: createRoleDto.name,
        descripcion: createRoleDto.description,
      });

      return await this.roleRepository.save(role);
    } catch (error) {
      this.handleQueryError(error);
    }
  }

  async findAll() {
    return await this.roleRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);

    if (updateRoleDto.name !== undefined) {
      role.nombre = updateRoleDto.name;
    }
    if (updateRoleDto.description !== undefined) {
      role.descripcion = updateRoleDto.description;
    }

    try {
      return await this.roleRepository.save(role);
    } catch (error) {
      this.handleQueryError(error);
    }
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);

    return { message: 'Rol eliminado correctamente' };
  }

  private handleQueryError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const pgError = error as QueryFailedError & { code?: string };

      if (pgError.code === '23505') {
        throw new ConflictException('El nombre del rol ya existe');
      }
    }

    throw error;
  }
}
