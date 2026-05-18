import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';

@Entity('usuario_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  user?: User;

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'rol_id' })
  role?: Role;
}
