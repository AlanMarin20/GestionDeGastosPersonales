import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly publicUserSelect = {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Extraemos la contraseña y el resto de los datos del DTO
    const { password, ...userData } = createUserDto;

    // 2. Encriptamos la contraseña (10 es el costo del algoritmo, es un buen estándar)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. TypeORM crea la instancia fusionando los datos y el hash
    const newUser = this.userRepository.create({ ...userData, passwordHash });

    // 4. Guarda el usuario en la base de datos y retorna el resultado
    let savedUser: User;
    try {
      savedUser = await this.userRepository.save(newUser);
    } catch (error) {
      if (this.isEmailAlreadyInUseError(error)) {
        throw new ConflictException('El email ya está en uso');
      }
      throw error;
    }

    return await this.userRepository.findOne({
      where: { id: savedUser.id },
      select: this.publicUserSelect,
    });
  }

  async findAll() {
    // Usamos 'find' y seleccionamos explícitamente qué columnas queremos devolver por seguridad
    return await this.userRepository.find({
      select: this.publicUserSelect,
    });
  }

  async findOne(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      select: this.publicUserSelect,
    });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findPublicById(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      select: this.publicUserSelect,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...userData } = updateUserDto;

    Object.assign(user, userData);

    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    const savedUser = await this.userRepository.save(user);

    return await this.userRepository.findOne({
      where: { id: savedUser.id },
      select: this.publicUserSelect,
    });
  }

  async remove(id: string) {
    await this.userRepository.delete(id);
    return { message: 'Usuario eliminado correctamente' };
  }

  async saveResetCode(userId: string, codeHash: string, expiresAt: Date) {
    await this.userRepository.update(userId, {
      resetCodeHash: codeHash,
      resetCodeExpiresAt: expiresAt,
    });
  }

  async clearResetCode(userId: string) {
    await this.userRepository.update(userId, {
      resetCodeHash: undefined,
      resetCodeExpiresAt: undefined,
    });
  }

  async updatePasswordHash(userId: string, newHash: string) {
    await this.userRepository.update(userId, { passwordHash: newHash });
  }

  private isEmailAlreadyInUseError(error: unknown) {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const databaseError = error as { code?: string; detail?: string };
    return (
      databaseError.code === '23505' &&
      databaseError.detail?.includes('(email)')
    );
  }
}
