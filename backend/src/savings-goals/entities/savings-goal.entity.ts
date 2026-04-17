import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('metas_ahorro')
export class SavingsGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ name: 'monto_objetivo', type: 'numeric', precision: 12, scale: 2 })
  targetAmount: number;

  @Column({
    name: 'monto_actual',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  currentAmount: number;

  @Column({ name: 'fecha_limite', type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ name: 'esta_activa', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp without time zone' })
  createdAt: Date;
}
