import { Controller, Post, UseGuards, Body, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-url')
  @UseGuards(JwtAuthGuard)
  async getPresignedUrl(
    @Body() body: { fileName: string; contentType: string },
  ) {
    return this.uploadService.getPresignedUrl(body.fileName, body.contentType);
  }

  @Post('guest-presigned-url')
  async getGuestPresignedUrl(
    @Body() body: { fileName: string; contentType: string },
  ) {
    return this.uploadService.getPresignedUrl(body.fileName, body.contentType);
  }
}
