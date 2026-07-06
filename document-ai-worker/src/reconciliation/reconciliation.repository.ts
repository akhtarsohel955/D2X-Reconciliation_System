import { AppDataSource } from '../config/database';
import { Reconciliation } from '../entity/reconciliation.entity';

export const ReconciliationRepository = AppDataSource.getRepository(Reconciliation);

export async function markReconciliationProcessing(reconciliationId: string) {
  await ReconciliationRepository.update(reconciliationId, {
    status: 'PROCESSING',
  });
}

export async function updateReconciliationStatus(
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
  await ReconciliationRepository.update(reconciliationId, {
    status,
    ...extra,
  });
}
