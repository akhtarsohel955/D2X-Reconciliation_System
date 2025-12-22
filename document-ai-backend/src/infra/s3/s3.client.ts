import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';


export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,
  forcePathStyle: false,
});
