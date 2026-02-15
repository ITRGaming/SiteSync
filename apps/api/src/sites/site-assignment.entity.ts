import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { User } from '../users/user.entity';

@Entity()
export class SiteAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Site, (site) => site.assignments, {
    onDelete: 'CASCADE',
  })
  site: Site;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn()
  assignedAt: Date;
}
