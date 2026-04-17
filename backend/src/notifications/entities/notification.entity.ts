import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notificaciones')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'varchar', default: 'info' })
  tipo: string;

  @Column({ name: 'fue_leida', type: 'boolean', default: false })
  wasRead: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp without time zone' })
  createdAt: Date;
}
