import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './attachment.entity';
import { StorageModule } from '../storage/storage.module';


@Module({
  imports: [TypeOrmModule.forFeature([Attachment]), StorageModule],
  providers: [AttachmentsService],
  controllers: [AttachmentsController]
})
export class AttachmentsModule {}
