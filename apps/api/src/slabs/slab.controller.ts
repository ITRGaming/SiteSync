import { Controller, Get, Post, Patch, Param, Body, Req } from '@nestjs/common';
import { SlabService } from './slab.service';

@Controller('slab')
export class SlabController {
  constructor(private slabService: SlabService) {}

  @Post('by-site/:phaseId')
  createSlab(
    @Param('phaseId') phaseId: string,
    @Body() body: { name: string },
    @Req() req,
  ) {
    return this.slabService.createSlab(Number(phaseId), body.name, req.user);
  }

  @Get('by-site/:siteId')
  getSlabs(@Param('siteId') siteId: string) {
    return this.slabService.getSlabsBySite(Number(siteId));
  }

  @Patch(':slabId/updateLevel')
  updateSlabLevel(
    @Param('slabId') slabId: string,
    @Body() body: { level: string },
    @Req() req,
  ) {
    return this.slabService.updateSlabLevel(
      Number(slabId),
      Number(body.level),
      req.user,
    );
  }
}
