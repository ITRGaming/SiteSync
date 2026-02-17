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
  ) {}

  async createSite(data: {
    name: string;
    location?: string;
    description?: string;
  }, user: any) {
    const site = this.siteRepo.create(data);
    const savedSite = await this.siteRepo.save(site);

    // Create default phase
    await this.phaseRepo.save([
      { type: PhaseType.PILES, site: savedSite, createdBy: { id: user.id } as User, updatedBy: { id: user.id } as User },
      { type: PhaseType.PLINTH, site: savedSite, createdBy: { id: user.id } as User, updatedBy: { id: user.id } as User },
      { type: PhaseType.RCC, site: savedSite, createdBy: { id: user.id } as User, updatedBy: { id: user.id } as User },
      { type: PhaseType.FINISHING, site: savedSite, createdBy: { id: user.id } as User, updatedBy: { id: user.id } as User },
      { type: PhaseType.PARKING, site: savedSite, createdBy: { id: user.id } as User, updatedBy: { id: user.id } as User },
    ]);

    return savedSite;
  }

  async assignEngineer(siteId: number, userId: number, user: any) {
    const restrictedRoles = ['SUPER_ADMIN', 'ADMIN'];

    const site = await this.siteRepo.findOne({ where: { id: siteId } });
    if (!site) throw new NotFoundException('Site not found');

    const userAsEngineer = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!userAsEngineer) throw new NotFoundException('User not found');

    if (restrictedRoles.includes(user.role.name)) {
      throw new BadRequestException('Cannot assign admin users to sites');
    }

    const existing = await this.assignmentRepo.findOne({
      where: {
        site: { id: siteId },
        user: { id: userAsEngineer.id },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `${userAsEngineer.role.name} already assigned to ${site.name}`,
      );
    }

    const assignment = this.assignmentRepo.create({ site, user, assignedBy: { id: user.id } as User });

    return this.assignmentRepo.save(assignment);
  }

  async getSitesForUser(user: any, isActive?: string) {
    const activeFilter = isActive === undefined ? true : isActive === 'true';
    // Super Admin sees all
    if (user.role === 'SUPER_ADMIN') {
      return this.siteRepo.find({
        where: { isActive: activeFilter },
      });
    }

    const assignments = await this.assignmentRepo.find({
      where: { user: { id: user.userId }, site: { isActive: activeFilter } },
      relations: ['site'],
    });

    return assignments.map((a) => a.site);
  }

  async getSiteDetails(id: number, user: any) {
    if (!user) throw new BadRequestException('User not found');

    const site = await this.siteRepo.findOne({
      where: { id },
      relations: ['phases'],
    });

    return site;
  }

  async softDelete(id: number, user: any) {
    const site = await this.siteRepo.findOne({ where: { id, isActive: true } });
    if (!site) throw new NotFoundException('Site not found');

    site.isActive = false;
    site.updatedBy = { id: user.id } as User;
    return this.siteRepo.save(site);
  }

  async restore(id: number, user: any) {
    const site = await this.siteRepo.findOne({
      where: { id, isActive: false },
    });
    if (!site) throw new NotFoundException('Site not found');

    site.isActive = true;
    site.updatedBy = { id: user.id } as User;
    return this.siteRepo.save(site);
  }

  async hardDelete(id: number, user: any) {
    const site = await this.siteRepo.findOne({ where: { id } });
    if (!site) throw new NotFoundException('Site not found');
    site.updatedBy = { id: user.id } as User;
    return this.siteRepo.delete(id);
  }
}
