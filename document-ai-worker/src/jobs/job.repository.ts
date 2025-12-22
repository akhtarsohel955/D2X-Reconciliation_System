import { AppDataSource } from '../config/database';
import { Job } from '../entity/job.entity';

export const JobRepository = AppDataSource.getRepository(Job);

export async function markJobProcessing(jobId: string) {
  await JobRepository.update(jobId, {
    status: 'PROCESSING',
  });
}

export async function updateJobStatus(
  jobId: string,
  status: string,
  extra?: {
    outputFileKey?: string;
    errorMessage?: string;
  },
) {
  await JobRepository.update(jobId, {
    status,
    ...extra,
  });
}
