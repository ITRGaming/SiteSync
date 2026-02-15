import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { PilesService } from './piles.service';

@Controller('piles')
export class PilesController {
  constructor(private pilesService: PilesService) {}

  @Post('by-site/:phaseId')
  createPile(
    @Param('phaseId') phaseId: string,
    @Body() body: { pileNumber?: string },
  ) {
    return this.pilesService.createPile(Number(phaseId), body.pileNumber);
  }

  @Get('by-site/:siteId')
  getPiles(@Param('siteId') siteId: string) {
    return this.pilesService.getPilesBySite(Number(siteId));
  }

  @Patch('number/:pileId')
  updatePileNumber(
    @Param('pileId') pileId: string,
    @Body() body: { pileNumber: string },
  ) {
    return this.pilesService.updatePileNumber(Number(pileId), body.pileNumber);
  }
}
