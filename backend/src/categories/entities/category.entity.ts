import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('categorias')
export class Category {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar' })
  name: string;

  @Column({ name: 'icono', type: 'varchar', nullable: true })
  icon?: string;

  @Column({ type: 'varchar', nullable: true })
  color?: string;

  @Column({ name: 'es_default', type: 'boolean', default: false })
  isDefault: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  user?: User;
}
