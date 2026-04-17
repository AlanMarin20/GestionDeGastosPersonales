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

@Entity('gastos')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'monto', type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'fecha_gasto', type: 'date', default: () => 'CURRENT_DATE' })
  expenseDate: Date;

  @Column({ name: 'comercio', type: 'varchar', nullable: true })
  merchant?: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'url_imagen_ticket', type: 'text', nullable: true })
  ticketImageUrl?: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  category?: Category;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp without time zone' })
  createdAt: Date;
}
