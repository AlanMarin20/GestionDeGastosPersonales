import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SavingsGoal } from '../../savings-goals/entities/savings-goal.entity';

export type TipoMovimientoAhorro = 'deposito' | 'retiro';

@Entity('movimientos_ahorro')
export class SavingsMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SavingsGoal, { nullable: false })
  @JoinColumn({ name: 'meta_id' })
  goal: SavingsGoal;

  @Column({ type: 'varchar', length: 20, default: 'deposito' })
  tipo: TipoMovimientoAhorro;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: number;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  fecha: Date;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp without time zone' })
  createdAt: Date;
}
