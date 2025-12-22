import { Controller, Post, Body } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-url')
  async getPresignedUrl(
    @Body() body: { fileName: string; contentType: string },
  ) {
    return this.uploadService.getPresignedUrl(
      body.fileName,
      body.contentType,
    );
  }
}
