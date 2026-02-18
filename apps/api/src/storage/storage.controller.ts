import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { R2Service } from './r2.service';
import { Public } from '../auth/public.decorator';

@Controller('storage')
export class StorageController {
  constructor(private readonly r2Service: R2Service) {}

  // Upload test file
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const key = await this.r2Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    return {
      message: 'Uploaded successfully',
      key,
    };
  }

  // View file using signed URL
  @Public()
  @Get('view/:key')
  async viewFile(@Param('key') key: string) {
    const url = await this.r2Service.getSignedUrl(key, 3600);
    return { url };
  }

  // Delete test file
  @Post('delete/:key')
  async deleteFile(@Param('key') key: string) {
    await this.r2Service.deleteFile(key);
    return { message: 'Deleted successfully' };
  }
}
