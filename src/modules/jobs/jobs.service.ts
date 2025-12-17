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
    userId: string;
    inputFileKey: string;
    inputFileType: string;
    documentType: 'EXPENSE' | 'HR';
  }) {
    const job = this.jobRepository.create({
      id: uuid(),
      userId: params.userId,
      inputFileKey: params.inputFileKey,
      inputFileType: params.inputFileType,
      documentType: params.documentType,
      status: 'PENDING',
    });

    const savedJob = await this.jobRepository.save(job);

    // 🔥 Push job to SQS (ASYNC processing starts here)
    await SqsProducer.sendJobMessage({
      jobId: savedJob.id,
      inputFileKey: savedJob.inputFileKey,
      documentType: savedJob.documentType,
    });

    return savedJob;
  }

  async getJobById(jobId: string) {
    return this.jobRepository.findOne({
      where: { id: jobId },
    });
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
