import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3.client';

const BUCKET = process.env.S3_BUCKET!;

export async function uploadExcelToS3(
  buffer: Buffer,
  key: string,
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
  );
}