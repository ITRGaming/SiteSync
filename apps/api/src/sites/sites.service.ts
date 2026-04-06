import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './site.entity';
import { SiteAssignment } from './site-assignment.entity';
import { User } from '../users/user.entity';
import { Phase, PhaseType } from 'src/phases/phase.entity';
import { Slab } from 'src/slabs/slab.entity';
import { SiteColumn } from 'src/columns/column.entity';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private siteRepo: Repository<Site>,

    @InjectRepository(SiteAssignment)
    private assignmentRepo: Repository<SiteAssignment>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Phase)
    private phaseRepo: Repository<Phase>,

    @InjectRepository(Slab)
    private slabRepo: Repository<Slab>,

    @InjectRepository(SiteColumn)
    private columnRepo: Repository<SiteColumn>,
  ) {}

  async createSite(
    data: {
      name: string;
      location?: string;
      description?: string;
      developer?: string;
      contractor?: string;
      totalSlabCount?: number;
      totalColumnCount?: number;
      slabs?: { name: string; level: number }[];
      columnNames?: string[];
      assignedUserIds?: number[];
    },
    user: User,
  ) {
    const site = this.siteRepo.create({
      name: data.name,
      location: data.location,
      description: data.description,
      developer: data.developer,
      contractor: data.contractor,
      totalSlabCount: data.totalSlabCount,
      totalColumnCount: data.totalColumnCount,
    });
    const savedSite = await this.siteRepo.save(site);

    // Create default phases
    await this.phaseRepo.save([
      {
        type: PhaseType.PILES,
        site: savedSite,
        createdBy: { id: user.id } as User,
        updatedBy: { id: user.id } as User,
      },
      {
        type: PhaseType.RCC,
        site: savedSite,
        totalSlabCount: data.totalSlabCount,
        createdBy: { id: user.id } as User,
        updatedBy: { id: user.id } as User,
      },
      {
        type: PhaseType.FINISHING,
        site: savedSite,
        createdBy: { id: user.id } as User,
        updatedBy: { id: user.id } as User,
      },
      {
        type: PhaseType.PARKING,
        site: savedSite,
        createdBy: { id: user.id } as User,
        updatedBy: { id: user.id } as User,
      },
    ]);

    // Save slabs from frontend (with names and levels)
    if (data.slabs && data.slabs.length > 0) {
      const slabs: Slab[] = data.slabs.map((s) =>
        this.slabRepo.create({
          site: savedSite,
          name: s.name,
          level: s.level,
          createdBy: { id: user.id } as User,
          updatedBy: { id: user.id } as User,
        }),
      );
      await this.slabRepo.save(slabs);
    }

    // Save columns from frontend (with user-provided names)
    if (data.columnNames && data.columnNames.length > 0) {
      const columns: SiteColumn[] = data.columnNames.map((colName) =>
        this.columnRepo.create({
          site: savedSite,
          name: colName,
          createdBy: { id: user.id } as User,
          updatedBy: { id: user.id } as User,
        }),
      );
      await this.columnRepo.save(columns);
    }

    // Assign users if assignedUserIds is provided
    if (data.assignedUserIds && data.assignedUserIds.length > 0) {
      for (const userId of data.assignedUserIds) {
        try {
          await this.assignEngineer(savedSite.id, userId, user);
        } catch (error) {
          console.error(
            `Failed to assign user ${userId} to site ${savedSite.id}`,
            error,
          );
        }
      }
    }

    return savedSite;
  }

  async assignEngineer(siteId: number, userId: number, user: User) {
    const restrictedRoles = ['SUPER_ADMIN', 'ADMIN'];

    const site = await this.siteRepo.findOne({ where: { id: siteId } });
    if (!site) throw new NotFoundException('Site not found');

    const userAsEngineer = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!userAsEngineer) throw new NotFoundException('User not found');

    if (restrictedRoles.includes(userAsEngineer.role.name)) {
      throw new BadRequestException('Cannot assign admin users to sites');
    }

    const existing = await this.assignmentRepo.findOne({
      where: {
        site: { id: siteId },
        user: { id: userId },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `${userAsEngineer.role.name} already assigned to ${site.name}`,
      );
    }

    const assignment = this.assignmentRepo.create({
      site: { id: siteId } as Site,
      user: { id: userId } as User,
      assignedBy: { id: user.id } as User,
    });

    return this.assignmentRepo.save(assignment);
  }

  async unassignEngineer(siteId: number, userId: number) {
    const site = await this.siteRepo.findOne({ where: { id: siteId } });
    if (!site) throw new NotFoundException('Site not found');

    const assignment = await this.assignmentRepo.findOne({
      where: {
        site: { id: siteId },
        user: { id: userId },
      },
    });

    if (!assignment) {
      throw new NotFoundException('User is not assigned to this site');
    }

    return this.assignmentRepo.remove(assignment);
  }

  async getSitesForUser(user: any, isActive?: string) {
    const activeFilter = isActive === undefined ? true : isActive === 'true';
    // Admins sees all
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      return this.siteRepo.find({
        where: { isActive: activeFilter },
        relations: ['assignments', 'assignments.user'],
      });
    }

    const assignments = await this.assignmentRepo.find({
      where: { user: { id: user.id }, site: { isActive: activeFilter } },
      relations: ['site', 'site.assignments', 'site.assignments.user'],
    });

    return assignments.map((a) => a.site);
  }

  async getSiteDetails(id: number, user: User) {
    if (!user) throw new BadRequestException('User not found');

    const site = await this.siteRepo.findOne({
      where: { id },
      relations: ['phases'],
    });

    return site;
  }

  async softDelete(id: number, user: User) {
    const site = await this.siteRepo.findOne({ where: { id, isActive: true } });
    if (!site) throw new NotFoundException('Site not found');

    site.isActive = false;
    site.updatedBy = { id: user.id } as User;
    site.updatedAt = new Date();
    return this.siteRepo.save(site);
  }

  async restore(id: number, user: User) {
    const site = await this.siteRepo.findOne({
      where: { id, isActive: false },
    });
    if (!site) throw new NotFoundException('Site not found');

    site.isActive = true;
    site.updatedBy = { id: user.id } as User;
    site.updatedAt = new Date();
    return this.siteRepo.save(site);
  }

  async hardDelete(id: number, user: User) {
    const site = await this.siteRepo.findOne({ where: { id } });
    if (!site) throw new NotFoundException('Site not found');
    site.updatedBy = { id: user.id } as User;
    site.updatedAt = new Date();
    return this.siteRepo.delete(id);
  }
}
