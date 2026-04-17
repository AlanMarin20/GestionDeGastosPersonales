import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateNotificationDto) {
    return this.notificationsService.create(req.user.sub, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.notificationsService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.notificationsService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, req.user.sub, updateDto);
  }

  @Patch(':id/read')
  markAsRead(@Request() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.notificationsService.remove(id, req.user.sub);
  }
}
