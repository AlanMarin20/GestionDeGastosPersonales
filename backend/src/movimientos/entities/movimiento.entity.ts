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

export type TipoMovimiento = 'ingreso' | 'egreso';

@Entity('movimientos')
export class Movimiento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  user!: User;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  category?: Category;

  @Column({ name: 'comercio', type: 'varchar', length: 150, nullable: true })
  comercio?: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'tipo', type: 'varchar', length: 20 })
  tipo!: TipoMovimiento;

  @Column({ name: 'monto', type: 'numeric', precision: 12, scale: 2 })
  monto!: number;

  @Column({ name: 'moneda', type: 'varchar', length: 10, default: 'ARS' })
  moneda!: string;

  @Column({ name: 'fecha', type: 'date', default: () => 'CURRENT_DATE' })
  fecha!: Date;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp without time zone' })
  creadoEn!: Date;
}
