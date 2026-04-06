import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SlabReportsService } from './slab-reports.service';

@Controller('slabs')
export class SlabReportsController {
  constructor(private slabReportsService: SlabReportsService) {}

  @Get(':slabId/report')
  async getReport(@Param('slabId') slabId: string) {
    return this.slabReportsService.getReport(Number(slabId));
  }

  @Patch(':slabId/report')
  async updateReport(
    @Param('slabId') slabId: string,
    @Body() body: any,
    @Req() req,
  ) {
    return this.slabReportsService.updateReport(
      Number(slabId),
      body,
      req.user,
    );
  }

  @Post(':slabId/report/submit')
  async submitReport(@Param('slabId') slabId: string, @Req() req) {
    return this.slabReportsService.submitReport(
      Number(slabId),
      req.user,
    );
  }
}
