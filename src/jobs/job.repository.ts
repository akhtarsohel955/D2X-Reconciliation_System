import { AppDataSource } from '../config/database';
import { Job } from '../entity/job.entity';

export const JobRepository = AppDataSource.getRepository(Job);

export async function markJobProcessing(jobId: string) {
  await JobRepository.update(jobId, {
    status: 'PROCESSING',
  });
}
