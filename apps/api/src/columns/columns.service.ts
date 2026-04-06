import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteColumn } from './column.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(SiteColumn)
    private columnRepo: Repository<SiteColumn>,
  ) {}

  getColumnsBySite(siteId: number) {
    return this.columnRepo.find({
      where: { site: { id: siteId } },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }

  async updateColumnName(columnId: number, name: string, user?: User) {
    const column = await this.columnRepo.findOne({
      where: { id: columnId },
    });

    if (!column) throw new NotFoundException('Column not found');

    column.name = name;
    column.updatedBy = { id: user?.id } as User;
    column.updatedAt = new Date();

    return this.columnRepo.save(column);
  }
}
