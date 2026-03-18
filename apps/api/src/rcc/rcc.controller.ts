import { Controller, Get, Post, Patch, Param, Body, Req } from '@nestjs/common';
import { RccService } from './rcc.service';

@Controller('rcc')
export class RccController {
  constructor(private rccService: RccService) {}

  @Post('by-site/:phaseId')
  createRcc(
    @Param('phaseId') phaseId: string,
    @Body() body: { name: string },
    @Req() req,
  ) {
    return this.rccService.createRcc(Number(phaseId), body.name, req.user);
  }

  @Get('by-site/:siteId')
  getRccs(@Param('siteId') siteId: string) {
    return this.rccService.getRccsBySite(Number(siteId));
  }

  @Patch(':rccId/updateLevel')
  updateRccLevel(
    @Param('rccId') rccId: string,
    @Body() body: { level: string },
    @Req() req,
  ) {
    return this.rccService.updateRccLevel(
      Number(rccId),
      Number(body.level),
      req.user,
    );
  }
}
