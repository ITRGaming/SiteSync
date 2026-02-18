import { Controller, Get, Post, Patch, Param, Body, Req } from '@nestjs/common';
import { PilesService } from './piles.service';

@Controller('piles')
export class PilesController {
  constructor(private pilesService: PilesService) {}

  @Post('by-site/:phaseId')
  createPile(
    @Param('phaseId') phaseId: string,
    @Body() body: { pileNumber?: string },
    @Req() req,
  ) {
    return this.pilesService.createPile(
      Number(phaseId),
      body.pileNumber,
      req.user,
    );
  }

  @Get('by-site/:siteId')
  getPiles(@Param('siteId') siteId: string) {
    return this.pilesService.getPilesBySite(Number(siteId));
  }

  @Patch('number/:pileId')
  updatePileNumber(
    @Param('pileId') pileId: string,
    @Body() body: { pileNumber: string },
    @Req() req,
  ) {
    return this.pilesService.updatePileNumber(
      Number(pileId),
      body.pileNumber,
      req.user,
    );
  }

  @Patch(':pileId/status')
  updatePileStatus(
    @Param('pileId') pileId: string,
    @Body()
    body: {
      integrityStatus?: string;
      cube7DayStatus?: string;
      cube28DayStatus?: string;
      eccentricityStatus?: string;
    },
    @Req() req,
  ) {
    return this.pilesService.updatePileStatus(Number(pileId), body, req.user);
  }
}
