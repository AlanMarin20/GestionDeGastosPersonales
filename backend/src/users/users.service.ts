import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
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
    return await this.userRepository.save(newUser);
  }

  async findAll() {
    // Usamos 'find' y seleccionamos explícitamente qué columnas queremos devolver por seguridad
    return await this.userRepository.find({
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    await this.userRepository.delete(id);
    return { message: 'Usuario eliminado correctamente' };
  }
}
