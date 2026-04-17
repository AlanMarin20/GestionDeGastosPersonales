import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoriesRepository.create(createCategoryDto);
      return await this.categoriesRepository.save(category);
    } catch (error) {
      this.handleQueryError(error);
    }
  }

  findAll() {
    return this.categoriesRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const categoryToUpdate = await this.categoriesRepository.preload({
      id,
      ...updateCategoryDto,
    });

    if (!categoryToUpdate) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    try {
      return await this.categoriesRepository.save(categoryToUpdate);
    } catch (error) {
      this.handleQueryError(error);
    }
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);

    return { message: 'Category deleted successfully' };
  }

  private handleQueryError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const pgError = error as QueryFailedError & { code?: string };

      if (pgError.code === '23505') {
        throw new ConflictException('Category name already exists');
      }
    }

    throw error;
  }
}
