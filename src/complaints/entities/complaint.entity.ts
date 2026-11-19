import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../departments/entities/department.entity';

export enum ComplaintStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  complaintNumber!: string;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ length: 100 })
  category!: string;

  @Column({ type: 'text' })
  location!: string;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDING,
  })
  status!: ComplaintStatus;


  // Original AI urgency prediction
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  aiUrgency!: string | null;

  // Confidence returned by the AI model
  @Column({
    type: 'double precision',
    nullable: true,
  })
  aiConfidence!: number | null;

  // Date and time when AI made the prediction
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  aiPredictedAt!: Date | null;


  // Officer-assessed severity score (0-100)
  @Column({
    type: 'int',
    nullable: true,
  })
  severityScore!: number | null;

  // Officer-assessed public impact score (0-100)
  @Column({
    type: 'int',
    nullable: true,
  })
  publicImpactScore!: number | null;

  // Officer-assessed safety risk score (0-100)
  @Column({
    type: 'int',
    nullable: true,
  })
  safetyRiskScore!: number | null;

  // Final calculated priority score (0-100)
  @Column({
    type: 'double precision',
    nullable: true,
  })
  priorityScore!: number | null;

    // Officer's verified urgency
  @Column({ type: 'varchar', length: 20, nullable: true })
  officerUrgency!: string | null;

  // Explanation if officer changes AI urgency
  @Column({ type: 'text', nullable: true })
  officerReviewNote!: string | null;

  // Review timestamp
  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;

  // Officer who reviewed the complaint
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy!: User | null;



  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'citizen_id' })
  citizen!: User;

  @ManyToOne(() => Department, (department) => department.complaints, {
    nullable: true,
  })
  @JoinColumn({ name: 'assigned_department_id' })
  assignedDepartment!: Department | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_by_id' }) 
  assignedBy!: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}