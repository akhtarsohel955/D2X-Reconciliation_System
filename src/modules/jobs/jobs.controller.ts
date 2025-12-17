import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

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

  // GET /jobs/:id
  @Get(':id')
  async getJob(@Param('id') jobId: string) {
    return this.jobsService.getJobById(jobId);
  }
}
