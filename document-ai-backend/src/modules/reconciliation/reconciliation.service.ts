import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Reconciliation } from './reconciliation.entity';
import { SqsProducer } from '../../infra/sqs/sqs.producer';

@Injectable()
export class ReconciliationService {
  constructor(
    @InjectRepository(Reconciliation)
    private readonly reconciliationRepository: Repository<Reconciliation>,
  ) {}

  async createReconciliation(params: {
    userId?: string;
    name?: string;
    sourceFileKeys: string[];
    targetFileKeys: string[];
    reconciliationType:
      | 'INVOICE_PO'
      | 'BANK_LEDGER'
      | 'TIMESHEET_PAYROLL'
      | 'GENERAL';
  }) {
    const reconciliation = this.reconciliationRepository.create({
      id: uuid(),
      userId: params.userId || 'guest',
      name: params.name,
      sourceFileKeys: params.sourceFileKeys,
      targetFileKeys: params.targetFileKeys,
      reconciliationType: params.reconciliationType,
      status: 'PENDING',
      matchedCount: 0,
      unmatchedCount: 0,
      discrepancyCount: 0,
    });

    const saved = await this.reconciliationRepository.save(reconciliation);

    // Send message to SQS for processing
    await SqsProducer.sendReconciliationMessage({
      reconciliationId: saved.id,
      sourceFileKeys: saved.sourceFileKeys,
      targetFileKeys: saved.targetFileKeys,
      reconciliationType: saved.reconciliationType,
    });

    return saved;
  }

  async getReconciliationById(reconciliationId: string, userId?: string) {
    if (userId) {
      return this.reconciliationRepository.findOne({
        where: { id: reconciliationId, userId },
      });
    } else {
      return this.reconciliationRepository.findOne({
        where: { id: reconciliationId },
      });
    }
  }

  async getUserReconciliations(userId: string) {
    return this.reconciliationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateReconciliationStatus(
    reconciliationId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    extra?: {
      resultFileKey?: string;
      matchingResults?: any;
      matchedCount?: number;
      unmatchedCount?: number;
      discrepancyCount?: number;
      errorMessage?: string;
    },
  ) {
    await this.reconciliationRepository.update(reconciliationId, {
      status,
      ...extra,
    });
  }
}
