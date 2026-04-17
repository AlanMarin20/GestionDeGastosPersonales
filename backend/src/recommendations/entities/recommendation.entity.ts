import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('recomendaciones')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'asesor_id' })
  advisor?: User;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'varchar', default: 'general' })
  tipo: string;

  @Column({ name: 'fue_leida', type: 'boolean', default: false })
  wasRead: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp without time zone' })
  createdAt: Date;
}
