import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Slab } from './slab.entity';
import { User } from '../users/user.entity';

export enum SlabReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
}

export enum MixType {
  RMC = 'RMC',
  SITE_MIX = 'SITE_MIX',
}

@Entity()
export class SlabExecutionReport {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Slab, (slab) => slab.executionReport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'slabId' })
  slab: Slab;

  // Header / Concrete Info
  @Column({ type: 'date', nullable: true })
  dateOfPour: string;

  @Column({ nullable: true })
  concreteGrade: string;

  @Column({
    type: 'enum',
    enum: MixType,
    default: MixType.RMC,
  })
  mixType: MixType;

  // Checklist
  @Column({ default: false })
  checklistCovering: boolean;

  @Column({ default: false })
  checklistSlabLevel: boolean;

  @Column({ default: false })
  checklistPropsShuttering: boolean;

  @Column({ default: false })
  checklistBindingWire: boolean;

  @Column({ default: false })
  checklistReinforcement: boolean;

  @Column({ default: false })
  checklistElectrical: boolean;

  // Site Mix Section
  @Column({ nullable: true })
  siteMixDesign: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  siteMixM1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  siteMixM2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  siteMixSand: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  siteMixWater: number;

  @Column({ nullable: true })
  siteMixCementBrand: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  siteMixCementKg: number;

  @Column({ nullable: true })
  siteMixAdmixSpec: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  siteMixAdmixMl: number;

  // Remarks
  @Column({ type: 'text', nullable: true })
  remarks: string;

  // Status & Metadata
  @Index()
  @Column({
    type: 'enum',
    enum: SlabReportStatus,
    default: SlabReportStatus.DRAFT,
  })
  status: SlabReportStatus;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'submittedByUserId' })
  submittedBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedByUserId' })
  updatedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
