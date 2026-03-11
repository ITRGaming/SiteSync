import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Phase } from '../phases/phase.entity';
import { PileExecutionReport } from '../pile-report/pile-execution-report.entity';
import { Site } from '../sites/site.entity';
import { User } from 'src/users/user.entity';

export enum PileStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum IntegrityStatus {
  OK = 'OK',
  SOFT_TOE = 'SOFT_TOE',
  OTHER = 'OTHER',
}

export enum EccentricityStatus {
  OK = 'OK',
  BELOW_50MM = '0 - 50mm',
  BELOW_100MM = '50 - 100mm',
  ABOVE_100MM = '100mm & Above',
}

@Entity()
export class Pile {
  @PrimaryGeneratedColumn()
  id: number;

  // Manual naming (1A, P2, 12B, etc.)
  @Column({ nullable: true })
  pileNumber: string;

  // Structural fields
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  diameter: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  groundLevel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cutOffLevel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  linerTopLevel: number;

  @Column({ nullable: true })
  location: string;

  // 🔥 Free text test status per pile (as you required)

  @Column({
    type: 'enum',
    nullable: true,
    enum: IntegrityStatus,
  })
  integrityStatus: IntegrityStatus;

  @Column({ type: 'text', nullable: true })
  cube7DayStatus: string;

  @Column({ type: 'text', nullable: true })
  cube28DayStatus: string;

  @Column({
    type: 'enum',
    nullable: true,
    enum: EccentricityStatus,
  })
  eccentricityStatus: EccentricityStatus;

  @ManyToOne(() => Site, (site) => site.piles, { onDelete: 'CASCADE' })
  site: Site;

  // Phase relation
  @ManyToOne(() => Phase, (phase) => phase.piles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  phase: Phase;

  // 1-to-1 Execution Report
  @OneToOne(() => PileExecutionReport, (report) => report.pile)
  executionReport: PileExecutionReport;

  // Workflow status
  @Column({
    type: 'enum',
    enum: PileStatus,
    default: PileStatus.PENDING,
  })
  status: PileStatus;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedByUserId' })
  updatedBy: User;
}
