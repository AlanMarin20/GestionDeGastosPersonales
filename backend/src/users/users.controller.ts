import {
  ForbiddenException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'asesor')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    this.assertSameUser(req, id);
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.updateWithAuthorization(id, updateUserDto, req);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    this.assertSameUser(req, id);
    return this.usersService.remove(id);
  }

  private assertSameUser(req: { user?: { sub?: string } }, userId: string) {
    if (req.user?.sub !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso',
      );
    }
  }

  private async updateWithAuthorization(
    userId: string,
    updateUserDto: UpdateUserDto,
    req: { user?: { sub?: string } },
  ) {
    await this.assertSameUserOrAdmin(req, userId);
    return this.usersService.update(userId, updateUserDto);
  }

  private async assertSameUserOrAdmin(
    req: { user?: { sub?: string } },
    userId: string,
  ) {
    const requesterId = req.user?.sub;
    if (!requesterId) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso',
      );
    }

    if (requesterId === userId) {
      return;
    }

    const userRoles = await this.dataSource.getRepository(UserRole).find({
      where: { user: { id: requesterId } },
      relations: { role: true },
    });

    const isAdmin = userRoles.some(
      (userRole) => userRole.role?.nombre?.toLowerCase() === 'admin',
    );

    if (!isAdmin) {
      throw new ForbiddenException(
        'No tienes permisos para editar este usuario',
      );
    }
  }
}
