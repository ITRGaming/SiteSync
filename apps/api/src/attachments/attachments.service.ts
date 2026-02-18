import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment, AttachmentType } from './attachment.entity';
import { R2Service } from '../storage/r2.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Site } from '../sites/site.entity';
import { Phase } from '../phases/phase.entity';
import { Pile } from '../piles/pile.entity';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepo: Repository<Attachment>,
    private r2Service: R2Service,
    private configService: ConfigService,
  ) {}

  // STORAGE LIMIT CHECK
  private async checkStorageLimit(newFileSize: number) {
    const total = await this.attachmentRepo
      .createQueryBuilder('attachment')
      .select('SUM(attachment.fileSize)', 'sum')
      .getRawOne();

    const currentUsage = Number(total.sum || 0);
    const maxMb = Number(this.configService.get('R2_MAX_STORAGE_MB'));
    const maxBytes = maxMb * 1024 * 1024;

    if (currentUsage + newFileSize > maxBytes) {
      throw new ForbiddenException('Storage limit reached.');
    }
  }

  async uploadAttachment(params: {
    file: Express.Multer.File;
    site: Site;
    phase?: Phase;
    pile?: Pile;
    type: AttachmentType;
    isPublic: boolean;
    user: User;
  }) {
    const { file, site, phase, pile, type, isPublic, user } = params;

    await this.checkStorageLimit(file.size);

    const key = await this.r2Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    const attachment = this.attachmentRepo.create({
      site,
      phase,
      pile,
      type,
      originalFileName: file.originalname,
      storageKey: key,
      mimeType: file.mimetype,
      fileSize: file.size,
      version: 1,
      isPublic,
      uploadedBy: user,
    });

    return await this.attachmentRepo.save(attachment);
  }

  async getAttachmentUrl(id: number, user?: User) {
    const attachment = await this.attachmentRepo.findOne({
      where: { id, isDeleted: false },
    });

    if (!attachment) throw new NotFoundException('Attachment not found');

    if (!attachment.isPublic && !user) {
      throw new ForbiddenException('Unauthorized');
    }

    return this.r2Service.getSignedUrl(attachment.storageKey);
  }

  async softDelete(id: number, user: User) {
    const attachment = await this.attachmentRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['uploadedBy'],
    });

    if (!attachment) throw new NotFoundException('Attachment not found');
    const role = user.role?.name;

    const isPrivileged = role === 'ADMIN' || role === 'SUPER_ADMIN';

    const isOwner = attachment.uploadedBy.id === user.id;

    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException('You cannot delete this file');
    }

    attachment.isDeleted = true;
    attachment.deletedBy = user;
    attachment.deletedAt = new Date();

    return this.attachmentRepo.save(attachment);
  }

  async permanentDelete(id: number) {
    const attachment = await this.attachmentRepo.findOne({
      where: { id },
    });

    if (!attachment) throw new NotFoundException('Attachment not found');

    await this.r2Service.deleteFile(attachment.storageKey);
    return this.attachmentRepo.remove(attachment);
  }

  async getByPhaseAndType(phaseId: number, type: AttachmentType) {
    return this.attachmentRepo.find({
      where: {
        phase: { id: phaseId },
        type,
        isDeleted: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getByPile(pileId: number) {
    return this.attachmentRepo.find({
      where: {
        pile: { id: pileId },
        isDeleted: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getByPileAndType(pileId: number, type: AttachmentType) {
    return this.attachmentRepo.find({
      where: {
        pile: { id: pileId },
        type,
        isDeleted: false,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
