import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async getAssignableUsers() {
    const restrictedRoles = ['SUPER_ADMIN', 'ADMIN'];

    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.name NOT IN (:...restricted)', {
        restricted: restrictedRoles,
      })
      .andWhere('user.isActive = :active', { active: true })
      .getMany();
  }

  async getUserDetails(userId: number) {
    if (!userId) throw new NotFoundException('User ID is required');
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
  }
}
