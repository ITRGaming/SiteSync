import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // SUPER_ADMIN | ADMIN | ENGINEER

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
