import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PhasesService } from './phases.service';
import { Roles } from 'src/auth/roles.decorator';

@Controller('phases')
export class PhasesController {
  constructor(private phasesService: PhasesService) {}

  @Get('site/:siteId')
  getPhases(@Param('siteId') siteId: string) {
    return this.phasesService.getPhaseBySite(Number(siteId));
  }

  @Patch(':id')
  updatePhase(@Param('id') id: string, @Body() body: { action: string }) {
    return this.phasesService.updatePhase(Number(id), body.action);
  }

  @Post(':id/start-piles')
  startPilePhase(
    @Param('id') id: string,
    @Body() body: { totalPileCount: string },
  ) {
    return this.phasesService.startPilePhase(
      Number(id),
      Number(body.totalPileCount),
    );
  }

  @Post('repair')
  @Roles('SUPER_ADMIN')
  repair() {
    return this.phasesService.repairMissingPhases();
  }
}
