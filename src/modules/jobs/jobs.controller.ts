import { Controller, Post, Body, Get, Param,HttpStatus} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Response } from 'express';0
import { generateDownloadUrl } from '../../infra/s3/s3.presign';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // POST /jobs
  @Post()
  async createJob(@Body() body: CreateJobDto) {
    // TEMP: hardcoded user (later from JWT)
    const userId = 'mock-user-id';

    const job = await this.jobsService.createJob({
      userId,
      inputFileKey: body.inputFileKey,
      inputFileType: body.inputFileType,
      documentType: body.documentType,
    });

    return {
      jobId: job.id,
      status: job.status,
    };
  }
    // JOB STATUS POLLING API
  @Get(':id/status')
  async getJobStatus(@Param('id') jobId: string) {
    const job = await this.jobsService.getJobById(jobId);

    if (!job) {
      return {
        statusCode: 404,
        message: 'Job not found',
      };
    }

    // FAILED job
    if (job.status === 'FAILED') {
      return {
        jobId: job.id,
        status: job.status,
        error: job.errorMessage || 'Processing failed',
      };
    }

    // PENDING / PROCESSING / COMPLETED
    return {
      jobId: job.id,
      status: job.status,
    };
  }
  // GET /jobs/:id
  @Get(':id/download')
  async downloadJobResult(@Param('id') jobId: string) {
    const job = await this.jobsService.getJobById(jobId);

    if (!job) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Job not found',
      };
    }

    if (job.status === 'PROCESSING' || job.status === 'PENDING') {
      return {
        statusCode: HttpStatus.ACCEPTED,
        status: job.status,
        message: 'Document is still being processed',
      };
    }

    if (job.status === 'FAILED') {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        status: 'FAILED',
        error: job.errorMessage || 'Processing failed',
      };
    }

    const downloadUrl = await generateDownloadUrl(
      process.env.S3_BUCKET!,
      job.outputFileKey!,
    );

    return {
      statusCode: HttpStatus.OK,
      status: 'COMPLETED',
      downloadUrl,
    };
  }
}
