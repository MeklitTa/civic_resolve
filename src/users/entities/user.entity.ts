import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';

export enum UserRole {
  CITIZEN = 'CITIZEN',
  COMPLAINT_OFFICER = 'COMPLAINT_OFFICER',
  DEPARTMENT_STAFF = 'DEPARTMENT_STAFF',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  fullName!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CITIZEN,
  })
  role!: UserRole;

  @ManyToOne(() => Department, (department) => department.staff, {
    nullable: true,
  })
  @JoinColumn({ name: 'department_id' })
  department!: Department | null;

  @CreateDateColumn()
  createdAt!: Date;
}