import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async findAll(userId: string): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { user: { id: userId } },
      order: { creadoEn: 'DESC' },
    });
  }

  async create(userId: string, dto: CreateTagDto): Promise<Tag> {
    const tag = this.tagRepository.create({
      nombre: dto.nombre,
      user: { id: userId },
    });
    return this.tagRepository.save(tag);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!tag) {
      throw new NotFoundException(`Etiqueta con id ${id} no encontrada`);
    }

    if (tag.user.id !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta etiqueta',
      );
    }

    await this.tagRepository.remove(tag);
    return { message: 'Etiqueta eliminada correctamente' };
  }
}
