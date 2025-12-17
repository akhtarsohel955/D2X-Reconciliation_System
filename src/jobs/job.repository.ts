import { AppDataSource } from '../config/database.js'
import { Job } from '../entity/job.entity.js';

export const JobRepository = AppDataSource.getRepository(Job);

export async function markJobProcessing(jobId: string) {
  await JobRepository.update(jobId, {
    status: 'PROCESSING',
  });
}
