import 'dotenv/config';
import { AppDataSource } from './config/database.js';
import { pollQueue } from './sqs/sqs.consumer.js';

async function bootstrap() {
  console.log('🚀 Worker starting...');

  await AppDataSource.initialize();
  console.log('✅ Database connected');

  await pollQueue();
}

bootstrap();
