import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Pile } from '../piles/pile.entity';
import { User } from '../users/user.entity';
import { BoringLog } from './boring-log.entity';
import { ReinforcementEntry } from './reinforcement-entry.entity';

export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
}

@Entity()
export class PileExecutionReport {
  @PrimaryGeneratedColumn()
  id: number;

  // 🔥 1:1 relationship
  @OneToOne(() => Pile, (pile) => pile.executionReport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pileId' })
  pile: Pile;

  // Header
  @Column({ type: 'date', nullable: true })
  reportDate: string;

  // Concrete
  @Column({ nullable: true })
  concreteGrade: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  theoreticalQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tremieLength: number;

  @Column({ type: 'timestamp', nullable: true })
  pourStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  pourEndTime: Date;

  @Column({ nullable: true })
  rmcSupplierName: string;

  // Reinforcement Summary
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalCageWeight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  msLinerLength: number;

  // Status
  @Index()
  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.DRAFT,
  })
  status: ReportStatus;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  submittedBy: User;

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => BoringLog, (log) => log.report, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  boringLogs: BoringLog[];

  @OneToMany(() => ReinforcementEntry, (entry) => entry.report, { 
    cascade: true,
    orphanedRowAction: 'delete',
  })
  reinforcementEntries: ReinforcementEntry[];
}
