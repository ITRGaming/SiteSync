import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { SitesService } from './sites.service';
import { Roles } from '../auth/roles.decorator';

@Controller('sites')
export class SitesController {
  constructor(private sitesService: SitesService) {}

  // Create Site (Admin + Super Admin)
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  createSite(
    @Body() body: { name: string; location?: string; description?: string },
    @Request() req,
  ) {
    return this.sitesService.createSite(body, req.user);
  }

  // Assign Engineer
  @Post(':siteId/assign/:userId')
  @Roles('SUPER_ADMIN', 'ADMIN')
  assignEngineer(
    @Param('siteId') siteId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.sitesService.assignEngineer(Number(siteId), Number(userId), req.user);
  }

  // Get Sites for Logged-in User
  @Get()
  getSites(@Request() req, @Query('isActive') isActive?: string) {
    return this.sitesService.getSitesForUser(req.user, isActive);
  }

  // Get Site Details
  @Get(':id')
  getSiteDetails(@Request() req, @Param('id') id: string) {
    return this.sitesService.getSiteDetails(Number(id), req.user);
  }

  // Soft Delete Site (Admin + Super Admin)
  @Patch(':id/delete')
  @Roles('SUPER_ADMIN', 'ADMIN')
  softDelete(@Param('id') id: string, @Request() req) {
    return this.sitesService.softDelete(Number(id), req.user);
  }

  @Patch(':id/restore')
  @Roles('SUPER_ADMIN', 'ADMIN')
  restoreSite(@Param('id') id: string, @Request() req) {
    return this.sitesService.restore(Number(id), req.user);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  hardDelete(@Param('id') id: string, @Request() req) {
    return this.sitesService.hardDelete(Number(id), req.user);
  }
}
