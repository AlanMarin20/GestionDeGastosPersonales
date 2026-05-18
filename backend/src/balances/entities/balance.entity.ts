import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('balances')
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'ingreso', type: 'numeric', precision: 12, scale: 2 })
  ingreso!: number;

  @Column({ name: 'egreso', type: 'numeric', precision: 12, scale: 2 })
  egreso!: number;

  @Column({ name: 'ahorro', type: 'numeric', precision: 12, scale: 2 })
  ahorro!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  user!: User;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp without time zone' })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
    type: 'timestamp without time zone',
  })
  updatedAt!: Date;
}
