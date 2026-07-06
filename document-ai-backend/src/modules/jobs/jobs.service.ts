import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Job } from './jobs.entity';
import { SqsProducer } from '../../infra/sqs/sqs.producer';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async createJob(params: {
    userId?: string;
    inputFileKey: string;
    documentType: 'EXPENSE' | 'HR';
  }) {
    const extension = params.inputFileKey.split('.').pop() || 'unknown';

    const job = this.jobRepository.create({
      id: uuid(),
      userId: params.userId || 'guest', // Use 'guest' for unauthenticated users
      inputFileKey: params.inputFileKey,
      inputFileType: extension, // ✅ derived here
      documentType: params.documentType,
      status: 'PENDING',
    });

    const savedJob = await this.jobRepository.save(job);

    await SqsProducer.sendJobMessage({
      jobId: savedJob.id,
      inputFileKey: savedJob.inputFileKey,
      documentType: savedJob.documentType,
    });

    return savedJob;
  }

  async getJobById(jobId: string, userId?: string) {
    if (userId) {
      return this.jobRepository.findOne({
        where: { id: jobId, userId },
      });
    } else {
      // For guest users, just find by jobId
      return this.jobRepository.findOne({
        where: { id: jobId },
      });
    }
  }

  async updateJobStatus(
    jobId: string,
    status: string,
    extra?: {
      outputFileKey?: string;
      errorMessage?: string;
    },
  ) {
    await this.jobRepository.update(jobId, {
      status,
      ...extra,
    });
  }
}
