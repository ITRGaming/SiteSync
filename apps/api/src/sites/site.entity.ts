import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SiteAssignment } from './site-assignment.entity';
import { Phase } from '../phases/phase.entity';
import { Pile } from 'src/piles/pile.entity';

@Entity()
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SiteAssignment, (assignment) => assignment.site)
  assignments: SiteAssignment[];

  @OneToMany(() => Phase, (phase) => phase.site)
  phases: Phase[];

  @OneToMany(() => Pile, (pile) => pile.site)
  piles: Pile[];
}
