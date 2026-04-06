import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { SiteAssignment } from './site-assignment.entity';
import { Phase } from '../phases/phase.entity';
import { Pile } from 'src/piles/pile.entity';
import { User } from 'src/users/user.entity';
import { Slab } from 'src/slabs/slab.entity';
import { Attachment } from 'src/attachments/attachment.entity';
import { SiteColumn } from 'src/columns/column.entity';

@Entity()
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  developer: string;

  @Column({ nullable: true })
  contractor: string;

  @Column({ nullable: true })
  totalSlabCount: number;

  @Column({ nullable: true })
  totalColumnCount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedByUserId' })
  updatedBy: User;

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

  @OneToMany(() => Slab, (slab) => slab.site)
  slabs: Slab[];

  @OneToMany(() => Attachment, (attachment) => attachment.site)
  attachments: Attachment[];

  @OneToMany(() => SiteColumn, (column) => column.site)
  columns: SiteColumn[];
}
