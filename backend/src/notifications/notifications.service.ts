import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(userId: string, createDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      mensaje: createDto.message,
      tipo: createDto.type ?? 'info',
      user: { id: userId },
    });

    return await this.notificationRepository.save(notification);
  }

  async findAll(userId: string) {
    return await this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException(`Notificación con id ${id} no encontrada`);
    }

    return notification;
  }

  async update(id: string, userId: string, updateDto: UpdateNotificationDto) {
    const notification = await this.findOne(id, userId);

    if (updateDto.message !== undefined) {
      notification.mensaje = updateDto.message;
    }
    if (updateDto.type !== undefined) {
      notification.tipo = updateDto.type;
    }
    if (updateDto.wasRead !== undefined) {
      notification.wasRead = updateDto.wasRead;
    }

    return await this.notificationRepository.save(notification);
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.findOne(id, userId);
    notification.wasRead = true;

    return await this.notificationRepository.save(notification);
  }

  async remove(id: string, userId: string) {
    const notification = await this.findOne(id, userId);
    await this.notificationRepository.remove(notification);

    return { message: 'Notificación eliminada correctamente' };
  }
}
