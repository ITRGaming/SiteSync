import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { PileReportService } from './pile-report.service';
import { UpdatePileReportDto } from './dto/update-pile-report.dto';

@Controller('piles/:pileId/report')
export class PileReportController {
  constructor(private readonly service: PileReportService) {}

  @Get()
  get(@Param('pileId', ParseIntPipe) pileId: number, @Req() req) {
    return this.service.getOrCreateReport(pileId, req.user);
  }

  @Patch()
  update(
    @Param('pileId', ParseIntPipe) pileId: number,
    @Body() dto: UpdatePileReportDto,
    @Req() req,
  ) {
    return this.service.updateReport(pileId, dto, req.user);
  }

  @Post('submit')
  submit(@Param('pileId', ParseIntPipe) pileId: number, @Req() req) {
    return this.service.submitReport(pileId, req.user);
  }
}
