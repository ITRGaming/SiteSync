import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Site } from '../sites/site.entity';
import { User } from 'src/users/user.entity';
import { SlabExecutionReport } from './slab-execution-report.entity';

export enum SlabStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity()
export class Slab {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  level: number;

  @ManyToOne(() => Site, (site) => site.slabs, { onDelete: 'CASCADE' })
  site: Site;

  @OneToOne(() => SlabExecutionReport, (report) => report.slab)
  executionReport: SlabExecutionReport;

  @Column({
    type: 'enum',
    enum: SlabStatus,
    default: SlabStatus.PENDING,
  })
  status: SlabStatus;

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
