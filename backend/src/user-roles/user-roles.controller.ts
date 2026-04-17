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
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRolesService } from './user-roles.service';

@UseGuards(AuthGuard)
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  create(@Body() createDto: CreateUserRoleDto) {
    return this.userRolesService.create(createDto);
  }

  @Get()
  findAll(@Request() req, @Query('scope') scope?: string, @Query('userId') userId?: string) {
    if (scope === 'me') {
      return this.userRolesService.findByUser(req.user.sub);
    }

    if (userId) {
      return this.userRolesService.findByUser(userId);
    }

    return this.userRolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userRolesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateUserRoleDto) {
    return this.userRolesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userRolesService.remove(id);
  }
}
