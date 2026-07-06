import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';
import { CreateReconciliationDto } from './dto/create-reconciliation.dto';
import { generateDownloadUrl } from '../../infra/s3/s3.presign';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  // POST /reconciliation (authenticated)
  @Post()
  @UseGuards(JwtAuthGuard)
  async createReconciliation(
    @Req() req: Request,
    @Body() body: CreateReconciliationDto,
  ) {
    const user = req.user as any;

    const reconciliation =
      await this.reconciliationService.createReconciliation({
        userId: user.userId,
        name: body.name,
        sourceFileKeys: body.sourceFileKeys,
        targetFileKeys: body.targetFileKeys,
        reconciliationType: body.reconciliationType,
      });

    return {
      reconciliationId: reconciliation.id,
      status: reconciliation.status,
    };
  }

  // POST /reconciliation/guest (guest users)
  @Post('guest')
  async createGuestReconciliation(@Body() body: CreateReconciliationDto) {
    const reconciliation =
      await this.reconciliationService.createReconciliation({
        name: body.name,
        sourceFileKeys: body.sourceFileKeys,
        targetFileKeys: body.targetFileKeys,
        reconciliationType: body.reconciliationType,
      });

    return {
      reconciliationId: reconciliation.id,
      status: reconciliation.status,
    };
  }

  // GET /reconciliation/:id/status (authenticated)
  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  async getReconciliationStatus(
    @Req() req: Request,
    @Param('id') reconciliationId: string,
  ) {
    const userId = (req.user as any).userId;
    const reconciliation =
      await this.reconciliationService.getReconciliationById(
        reconciliationId,
        userId,
      );

    if (!reconciliation) {
      return {
        statusCode: 404,
        message: 'Reconciliation not found',
      };
    }

    if (reconciliation.status === 'FAILED') {
      return {
        reconciliationId: reconciliation.id,
        status: reconciliation.status,
        error: reconciliation.errorMessage || 'Processing failed',
      };
    }

    return {
      reconciliationId: reconciliation.id,
      status: reconciliation.status,
      matchedCount: reconciliation.matchedCount,
      unmatchedCount: reconciliation.unmatchedCount,
      discrepancyCount: reconciliation.discrepancyCount,
    };
  }

  // GET /reconciliation/guest/:id/status (guest users)
  @Get('guest/:id/status')
  async getGuestReconciliationStatus(@Param('id') reconciliationId: string) {
    const reconciliation =
      await this.reconciliationService.getReconciliationById(reconciliationId);

    if (!reconciliation) {
      return {
        statusCode: 404,
        message: 'Reconciliation not found',
      };
    }

    if (reconciliation.status === 'FAILED') {
      return {
        reconciliationId: reconciliation.id,
        status: reconciliation.status,
        error: reconciliation.errorMessage || 'Processing failed',
      };
    }

    return {
      reconciliationId: reconciliation.id,
      status: reconciliation.status,
      matchedCount: reconciliation.matchedCount,
      unmatchedCount: reconciliation.unmatchedCount,
      discrepancyCount: reconciliation.discrepancyCount,
    };
  }

  // GET /reconciliation/:id/download (authenticated)
  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadReconciliationResult(
    @Req() req: Request,
    @Param('id') reconciliationId: string,
  ) {
    const userId = (req.user as any).userId;
    const reconciliation =
      await this.reconciliationService.getReconciliationById(
        reconciliationId,
        userId,
      );

    if (!reconciliation) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Reconciliation not found',
      };
    }

    if (
      reconciliation.status === 'PROCESSING' ||
      reconciliation.status === 'PENDING'
    ) {
      return {
        statusCode: HttpStatus.ACCEPTED,
        status: reconciliation.status,
        message: 'Reconciliation is still being processed',
      };
    }

    if (reconciliation.status === 'FAILED') {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        status: 'FAILED',
        error: reconciliation.errorMessage || 'Processing failed',
      };
    }

    const downloadUrl = await generateDownloadUrl(
      process.env.S3_BUCKET!,
      reconciliation.resultFileKey!,
    );

    return {
      statusCode: HttpStatus.OK,
      status: 'COMPLETED',
      downloadUrl,
      matchedCount: reconciliation.matchedCount,
      unmatchedCount: reconciliation.unmatchedCount,
      discrepancyCount: reconciliation.discrepancyCount,
    };
  }

  // GET /reconciliation/guest/:id/download (guest users)
  @Get('guest/:id/download')
  async downloadGuestReconciliationResult(
    @Param('id') reconciliationId: string,
  ) {
    const reconciliation =
      await this.reconciliationService.getReconciliationById(reconciliationId);

    if (!reconciliation) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Reconciliation not found',
      };
    }

    if (
      reconciliation.status === 'PROCESSING' ||
      reconciliation.status === 'PENDING'
    ) {
      return {
        statusCode: HttpStatus.ACCEPTED,
        status: reconciliation.status,
        message: 'Reconciliation is still being processed',
      };
    }

    if (reconciliation.status === 'FAILED') {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        status: 'FAILED',
        error: reconciliation.errorMessage || 'Processing failed',
      };
    }

    const downloadUrl = await generateDownloadUrl(
      process.env.S3_BUCKET!,
      reconciliation.resultFileKey!,
    );

    return {
      statusCode: HttpStatus.OK,
      status: 'COMPLETED',
      downloadUrl,
      matchedCount: reconciliation.matchedCount,
      unmatchedCount: reconciliation.unmatchedCount,
      discrepancyCount: reconciliation.discrepancyCount,
    };
  }

  // GET /reconciliation/user/list (authenticated - get user's reconciliations)
  @Get('user/list')
  @UseGuards(JwtAuthGuard)
  async getUserReconciliations(@Req() req: Request) {
    const userId = (req.user as any).userId;
    const reconciliations =
      await this.reconciliationService.getUserReconciliations(userId);

    return {
      reconciliations: reconciliations.map((r) => ({
        id: r.id,
        name: r.name,
        status: r.status,
        reconciliationType: r.reconciliationType,
        matchedCount: r.matchedCount,
        unmatchedCount: r.unmatchedCount,
        discrepancyCount: r.discrepancyCount,
        createdAt: r.createdAt,
      })),
    };
  }
}
