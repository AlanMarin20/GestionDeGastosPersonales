import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('ingresos')
export class Income {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'monto', type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({
    name: 'fecha_ingreso',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  incomeDate: Date;

  @Column({ name: 'fuente', type: 'varchar', nullable: true })
  source?: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  category?: Category;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp without time zone' })
  createdAt: Date;
}
