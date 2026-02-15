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

export enum PileStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
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

  @Column({ type: 'text', nullable: true })
  integrityStatus: string;

  @Column({ type: 'text', nullable: true })
  cube7DayStatus: string;

  @Column({ type: 'text', nullable: true })
  cube28DayStatus: string;

  @Column({ type: 'text', nullable: true })
  eccentricityStatus: string;

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
}
