import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Complaint } from '../../complaints/entities/complaint.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => User, (user) => user.department)
  staff!: User[]; 

  @OneToMany(() => Complaint, (complaint) => complaint.assignedDepartment)
  complaints!: Complaint[]; 

  @CreateDateColumn()
  createdAt!: Date;
}