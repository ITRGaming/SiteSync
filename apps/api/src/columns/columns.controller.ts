import { Controller, Get, Patch, Param, Body, Req } from '@nestjs/common';
import { ColumnsService } from './columns.service';

@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Get('by-site/:siteId')
  getColumns(@Param('siteId') siteId: string) {
    return this.columnsService.getColumnsBySite(Number(siteId));
  }

  @Patch(':columnId/update-name')
  updateColumnName(
    @Param('columnId') columnId: string,
    @Body() body: { name: string },
    @Req() req,
  ) {
    return this.columnsService.updateColumnName(
      Number(columnId),
      body.name,
      req.user,
    );
  }
}
