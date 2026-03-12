import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findOneByEmailWithPassword(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'fullName',
        'isActive',
        'mustChangePassword',
      ],
      relations: ['role'],
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

  async getAllUsers() {
    return this.userRepository.find({
      relations: ['role'],
      order: { id: 'DESC' },
    });
  }

  async createUser(dto: CreateUserDto, creatorId: number) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    const role = await this.roleRepository.findOne({
      where: { name: dto.role },
    });
    if (!role) throw new BadRequestException('Invalid role');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const creator = await this.userRepository.findOne({
      where: { id: creatorId },
    });

    if (!creator) throw new NotFoundException('Creator not found');

    const user = this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      role: role,
      mustChangePassword: true, // force change on first login
      createdBy: { id: creator.id } as User,
    });

    return this.userRepository.save(user);
  }

  async updateUser(userId: number, dto: UpdateUserDto, updaterId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isChanged = Object.keys(dto).some((key) => dto[key] !== user[key]);
    if (!isChanged) return user;

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) throw new BadRequestException('Email already in use');
    }

    const updater = await this.userRepository.findOne({
      where: { id: updaterId },
    });

    if (!updater) throw new NotFoundException('Updater not found');

    Object.assign(user, dto);
    user.updatedBy = { id: updater.id } as User;

    return this.userRepository.save(user);
  }

  async changeRole(
    userId: number,
    roleName: string,
    updaterId: number,
    currentRole: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('User not found');

    // Prevent ADMIN from changing SUPER_ADMIN's role
    if (currentRole === 'ADMIN' && user.role.name === 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot modify Super Admin role');
    }

    if (currentRole === 'ADMIN' && roleName === 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Only Super Admins can assign the Super Admin role',
      );
    }

    if (user.role.name === roleName) return user;

    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });
    if (!role) throw new BadRequestException('Invalid role');

    const updater = await this.userRepository.findOne({
      where: { id: updaterId },
    });

    if (!updater) throw new NotFoundException('Updater not found');

    user.role = role;
    user.updatedBy = { id: updater.id } as User;

    return this.userRepository.save(user);
  }

  async setActivationStatus(
    userId: number,
    isActive: boolean,
    updaterId: number,
    currentRole: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('User not found');

    // Prevent ADMIN from deactivating SUPER_ADMIN
    if (currentRole === 'ADMIN' && user.role.name === 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Cannot modify Super Admin activation status',
      );
    }

    if (user.isActive === isActive) return user;

    // Prevent self-deactivation
    if (userId === updaterId && !isActive) {
      throw new BadRequestException('Cannot deactivate yourself');
    }

    const updater = await this.userRepository.findOne({
      where: { id: updaterId },
    });

    if (!updater) throw new NotFoundException('Updater not found');

    user.isActive = isActive;
    user.updatedBy = { id: updater.id } as User;

    return this.userRepository.save(user);
  }

  async changeOwnPassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password', 'mustChangePassword'],
    });

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Incorrect old password');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.mustChangePassword = false;

    await this.userRepository.save(user);
    return { success: true };
  }

  async adminResetPassword(
    userId: number,
    dto: ResetPasswordDto,
    updaterId: number,
    currentRole: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('User not found');

    // Prevent ADMIN from resetting SUPER_ADMIN
    if (currentRole === 'ADMIN' && user.role.name === 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot modify Super Admin password');
    }

    const updater = await this.userRepository.findOne({
      where: { id: updaterId },
    });

    if (!updater) throw new NotFoundException('Updater not found');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.mustChangePassword = true; // force change again
    user.updatedBy = { id: updater.id } as User;

    await this.userRepository.save(user);
    return { success: true };
  }
}
