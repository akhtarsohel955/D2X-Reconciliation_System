import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from './config/database';
import { pollQueue } from './sqs/sqs.consumer';


async function bootstrap() {
  console.log('🚀 Worker starting...');

  await AppDataSource.initialize();
  console.log('✅ Database connected');

  await pollQueue();
}

bootstrap();
