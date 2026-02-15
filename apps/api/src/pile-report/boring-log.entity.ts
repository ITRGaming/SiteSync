import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PileExecutionReport } from './pile-execution-report.entity';

@Entity()
export class BoringLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PileExecutionReport, (report) => report.boringLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  report: PileExecutionReport;

  @Column({ type: 'timestamp' })
  fromTime: Date;

  @Column({ type: 'timestamp' })
  toTime: Date;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  depth: number;

  @Column({ nullable: true })
  toolType: string;

  @Column({ nullable: true })
  activity: string;

  @Column({ nullable: true })
  strata: string;

  @Column({ nullable: true })
  remark: string;
}
