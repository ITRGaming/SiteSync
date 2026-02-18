import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Site } from '../sites/site.entity';
import { Phase } from '../phases/phase.entity';
import { Pile } from '../piles/pile.entity';
import { User } from '../users/user.entity';

export enum AttachmentType {
  DRAWING = 'DRAWING',
  CUBE_7_DAY = 'CUBE_7_DAY',
  CUBE_28_DAY = 'CUBE_28_DAY',
  INTEGRITY_TEST = 'INTEGRITY_TEST',
  ECCENTRICITY_CHECK = 'ECCENTRICITY_CHECK',
  PILE_READING = 'PILE_READING',
  OTHER = 'OTHER',
}

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Site, { nullable: false, onDelete: 'CASCADE' })
  site: Site;

  @ManyToOne(() => Phase, { nullable: true, onDelete: 'CASCADE' })
  phase?: Phase;

  @ManyToOne(() => Pile, { nullable: true, onDelete: 'CASCADE' })
  pile?: Pile;

  @Column({
    type: 'enum',
    enum: AttachmentType,
  })
  type: AttachmentType;

  @Column()
  originalFileName: string;

  @Column()
  storageKey: string;

  @Column()
  mimeType: string;

  @Column()
  fileSize: number;

  @Column({ default: 1 })
  version: number;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => User)
  uploadedBy: User;

  @ManyToOne(() => User, { nullable: true })
  deletedBy?: User;

  @Column({ nullable: true })
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
