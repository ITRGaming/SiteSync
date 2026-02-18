import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  Param,
  Get,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { AttachmentType } from './attachment.entity';
import { Roles } from '../auth/roles.decorator';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req,
  ) {
    const user = req.user as any;

    return this.attachmentsService.uploadAttachment({
      file,
      site: { id: Number(body.siteId) } as any,
      phase: body.phaseId ? ({ id: Number(body.phaseId) } as any) : undefined,
      pile: body.pileId ? ({ id: Number(body.pileId) } as any) : undefined,
      type: body.type as AttachmentType,
      isPublic: body.isPublic === 'true',
      user,
    });
  }

  // 🔹 Get File URL (Public or Private)
  @Get(':id')
  async getUrl(@Param('id') id: number, @Req() req) {
    const user = req.user as any;
    return this.attachmentsService.getAttachmentUrl(Number(id), user);
  }

  // 🔹 Soft Delete (Owner/Admin)
  @Delete(':id')
  async softDelete(@Param('id') id: number, @Req() req) {
    const user = req.user as any;
    return this.attachmentsService.softDelete(Number(id), user);
  }

  // 🔹 Permanent Delete (Super Admin Only)
  @Roles('SUPER_ADMIN')
  @Delete('permanent/:id')
  async permanentDelete(@Param('id') id: number) {
    return this.attachmentsService.permanentDelete(Number(id));
  }

  @Get('by-phase/:phaseId/type/:type')
  async getByPhaseAndType(
    @Param('phaseId') phaseId: number,
    @Param('type') type: string,
  ) {
    const id = Number(phaseId);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid phaseId');
    }
    return this.attachmentsService.getByPhaseAndType(id, type as AttachmentType);
  }

  @Get('by-pile/:pileId')
  async getByPile(@Param('pileId') pileId: number) {
    const id = Number(pileId);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid pileId');
    }
    return this.attachmentsService.getByPile(id);
  }

  @Get('by-pile/:pileId/type/:type')
  async getByPileAndType(
    @Param('pileId') pileId: string,
    @Param('type') type: string,
  ) {
    return this.attachmentsService.getByPileAndType(
      Number(pileId),
      type as AttachmentType,
    );
  }
}
