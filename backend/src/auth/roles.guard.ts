import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../user-roles/entities/user-role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId: string | undefined = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('No se encontró el contexto del usuario');
    }

    const userRoles = await this.dataSource.getRepository(UserRole).find({
      where: { user: { id: userId } },
      relations: { role: true },
    });

    const normalizedRequiredRoles = requiredRoles.map((role) =>
      role.toLowerCase(),
    );
    const normalizedUserRoles = userRoles
      .map((userRole) => userRole.role?.nombre)
      .filter((roleName): roleName is string => Boolean(roleName))
      .map((roleName) => roleName.toLowerCase());

    const hasPermission = normalizedRequiredRoles.some((requiredRole) =>
      normalizedUserRoles.includes(requiredRole),
    );

    if (!hasPermission) {
      throw new ForbiddenException('No tienes permisos suficientes para este recurso');
    }

    return true;
  }
}
