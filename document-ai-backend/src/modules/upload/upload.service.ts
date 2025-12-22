import { Injectable } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../../infra/s3/s3.client';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {
  async getPresignedUrl(fileName: string, contentType: string) {
    const key = `uploads/${uuid()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    return { url, key };
  }
}
