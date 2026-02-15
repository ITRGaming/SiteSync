import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Site } from '../sites/site.entity';
import { Phase } from '../phases/phase.entity';
import { User } from '../users/user.entity';

export enum AttachmentCategory {
  DRAWING = 'DRAWING',
  CUBE_7_DAY = 'CUBE_7_DAY',
  CUBE_28_DAY = 'CUBE_28_DAY',
  INTEGRITY_TEST = 'INTEGRITY_TEST',
  ECCENTRICITY_CHECK = 'ECCENTRICITY_CHECK',
}

@Entity()
export class SitePhaseAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  site: Site;

  @ManyToOne(() => Phase, { onDelete: 'CASCADE' })
  phase: Phase;

  @Column({
    type: 'enum',
    enum: AttachmentCategory,
  })
  category: AttachmentCategory;

  @Column()
  fileUrl: string;

  @ManyToOne(() => User)
  uploadedBy: User;

  @CreateDateColumn()
  uploadedAt: Date;
}
