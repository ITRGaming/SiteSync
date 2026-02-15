import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PileExecutionReport } from './pile-execution-report.entity';

@Entity()
export class ReinforcementEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PileExecutionReport, (report) => report.reinforcementEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  report: PileExecutionReport;

  @Column()
  barShape: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  barDiameter: number;

  @Column({ type: 'int' })
  numberOfBars: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  length: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalLengthRmt: number;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  weightPerRmt: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalWeight: number;
}
