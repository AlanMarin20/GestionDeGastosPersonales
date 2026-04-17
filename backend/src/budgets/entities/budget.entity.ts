import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';

@Entity('presupuestos')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'categoria_id' })
  category: Category;

  @Column({ name: 'monto_limite', type: 'numeric', precision: 12, scale: 2 })
  amountLimit: number;

  @Column({ name: 'mes', type: 'integer' })
  month: number;

  @Column({ name: 'anio', type: 'integer' })
  year: number;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp without time zone' })
  createdAt: Date;
}
