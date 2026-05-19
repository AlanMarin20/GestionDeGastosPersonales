import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nombre_completo', type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'contrasenia_hash', type: 'varchar' })
  passwordHash: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'asesor_id' })
  advisor?: User;

  @Column({
    name: 'codigo_vinculacion',
    type: 'varchar',
    length: 20,
    nullable: true,
    unique: true,
  })
  codigoVinculacion?: string;

  @Column({
    name: 'codigo_expira_en',
    type: 'timestamp without time zone',
    nullable: true,
  })
  codigoExpiraEn?: Date;

  @Column({ name: 'codigo_reset_hash', type: 'varchar', nullable: true })
  resetCodeHash?: string;

  @Column({
    name: 'reset_expira_en',
    type: 'timestamp without time zone',
    nullable: true,
  })
  resetCodeExpiresAt?: Date;

  @Column({ name: 'email_verificado', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'esta_activo', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
    type: 'timestamp without time zone',
  })
  updatedAt: Date;
}
