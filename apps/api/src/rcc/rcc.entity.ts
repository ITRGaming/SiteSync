import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Phase } from '../phases/phase.entity';
import { Site } from '../sites/site.entity';
import { User } from 'src/users/user.entity';

@Entity()
export class Rcc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  level: number;

  @ManyToOne(() => Site, (site) => site.rccs, { onDelete: 'CASCADE' })
  site: Site;

  // Phase relation
  @ManyToOne(() => Phase, (phase) => phase.rccs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  phase: Phase;

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
