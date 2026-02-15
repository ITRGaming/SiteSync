import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Phase } from '../phases/phase.entity';
import { Site } from 'src/sites/site.entity';

@Entity()
@Unique(['pileNumber', 'phase'])
export class Pile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  pileNumber: string;

  @Column({ default: false })
  isReportSubmitted: boolean;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Site, (site) => site.piles, { onDelete: 'CASCADE' })
  site: Site;

  @ManyToOne(() => Phase, { onDelete: 'CASCADE' })
  phase: Phase;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
