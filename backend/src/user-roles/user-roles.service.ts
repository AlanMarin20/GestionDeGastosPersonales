import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createDto: CreateUserRoleDto) {
    await this.ensureUserExists(createDto.userId);
    const role = await this.ensureRoleExists(createDto.roleId);

    const userRole = this.userRoleRepository.create({
      user: { id: createDto.userId },
      role: { id: role.id },
    });

    return await this.userRoleRepository.save(userRole);
  }

  async findAll() {
    return await this.userRoleRepository.find({
      relations: { user: true, role: true },
      order: { id: 'DESC' },
    });
  }

  async findByUser(userId: string) {
    await this.ensureUserExists(userId);

    return await this.userRoleRepository.find({
      where: { user: { id: userId } },
      relations: { role: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: string) {
    const userRole = await this.userRoleRepository.findOne({
      where: { id },
      relations: { user: true, role: true },
    });

    if (!userRole) {
      throw new NotFoundException(`User role with id ${id} not found`);
    }

    return userRole;
  }

  async update(id: string, updateDto: UpdateUserRoleDto) {
    const userRole = await this.findOne(id);

    if (updateDto.userId !== undefined) {
      await this.ensureUserExists(updateDto.userId);
      userRole.user = { id: updateDto.userId } as UserRole['user'];
    }

    if (updateDto.roleId !== undefined) {
      const role = await this.ensureRoleExists(updateDto.roleId);
      userRole.role = { id: role.id } as UserRole['role'];
    }

    return await this.userRoleRepository.save(userRole);
  }

  async remove(id: string) {
    const userRole = await this.findOne(id);
    await this.userRoleRepository.remove(userRole);

    return { message: 'User role deleted successfully' };
  }

  private async ensureUserExists(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user;
  }

  private async ensureRoleExists(roleId: number) {
    const role = await this.roleRepository.findOneBy({ id: roleId });
    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }

    return role;
  }
}
