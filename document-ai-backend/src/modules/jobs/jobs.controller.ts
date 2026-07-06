import { Controller, Post, Body, Get, Param, HttpStatus } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

import { generateDownloadUrl } from '../../infra/s3/s3.presign';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // POST /jobs (authenticated)
  @Post()
  @UseGuards(JwtAuthGuard)
  async createJob(@Req() req: Request, @Body() body: CreateJobDto) {
    const user = req.user as any;

    const job = await this.jobsService.createJob({
      userId: user.userId,
      inputFileKey: body.inputFileKey,
      documentType: body.documentType,
    });

    return {
      jobId: job.id,
      status: job.status,
    };
  }

  // POST /jobs/guest (guest users)
  @Post('guest')
  async createGuestJob(@Body() body: CreateJobDto) {
    const job = await this.jobsService.createJob({
      inputFileKey: body.inputFileKey,
      documentType: body.documentType,
    });

    return {
      jobId: job.id,
      status: job.status,
    };
  }

  // GET /jobs/:id/status (authenticated)
  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  async getJobStatus(@Req() req: Request, @Param('id') jobId: string) {
    const userId = (req.user as any).userId;
    const job = await this.jobsService.getJobById(jobId, userId);

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

  // GET /jobs/guest/:id/status (guest users)
  @Get('guest/:id/status')
  async getGuestJobStatus(@Param('id') jobId: string) {
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

  // GET /jobs/:id/download (authenticated)
  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadJobResult(@Req() req: Request, @Param('id') jobId: string) {
    const userId = (req.user as any).userId;
    const job = await this.jobsService.getJobById(jobId, userId);

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

  // GET /jobs/guest/:id/download (guest users)
  @Get('guest/:id/download')
  async downloadGuestJobResult(@Param('id') jobId: string) {
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
