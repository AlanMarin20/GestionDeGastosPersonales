import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRolesService } from './user-roles.service';

@UseGuards(AuthGuard)
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createDto: CreateUserRoleDto) {
    return this.userRolesService.create(createDto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'asesor')
  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.userRolesService.findByUser(userId);
    }

    return this.userRolesService.findAll();
  }

  @Roles('admin', 'asesor', 'usuario')
  @Get('me')
  findMine(@Request() req) {
    return this.userRolesService.findByUser(req.user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'asesor')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userRolesService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateUserRoleDto) {
    return this.userRolesService.update(id, updateDto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userRolesService.remove(id);
  }
}
