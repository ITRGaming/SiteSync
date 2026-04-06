import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { Site } from './site.entity';
import { SiteAssignment } from './site-assignment.entity';
import { User } from '../users/user.entity';
import { Phase } from '../phases/phase.entity';
import { Slab } from 'src/slabs/slab.entity';
import { SiteColumn } from 'src/columns/column.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Site, SiteAssignment, User, Phase, Slab, SiteColumn]),
  ],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
