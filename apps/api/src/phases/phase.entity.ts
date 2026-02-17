import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Site } from '../sites/site.entity';
import { Pile } from '../piles/pile.entity';
import { User } from 'src/users/user.entity';

export enum PhaseType {
  PILES = 'PILES',
  PLINTH = 'PLINTH',
  RCC = 'RCC',
  FINISHING = 'FINISHING',
  PARKING = 'PARKING',
}

@Entity()
export class Phase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PhaseType,
  })
  type: PhaseType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @ManyToOne(() => Site, (site) => site.phases, {
    onDelete: 'CASCADE',
  })
  site: Site;

  @OneToMany(() => Pile, (pile) => pile.phase)
  piles: Pile[];

  @Column({ nullable: true })
  totalPileCount: number;

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
