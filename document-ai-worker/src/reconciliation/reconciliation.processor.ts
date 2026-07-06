import { TextractService } from '../textract/textract.service';
import { parseExpenseDocuments } from '../parsers/expense.parser';
import { uploadExcelToS3 } from '../storage/s3.service';
import {
  markReconciliationProcessing,
  updateReconciliationStatus,
} from './reconciliation.repository';
import { reconcileRecords, RecordToMatch } from './matching.engine';
import { generateReconciliationExcel } from './reconciliation.exporter';

export async function processReconciliation(payload: {
  reconciliationId: string;
  sourceFileKeys: string[];
  targetFileKeys: string[];
  reconciliationType: string;
}) {
  const { reconciliationId, sourceFileKeys, targetFileKeys, reconciliationType } = payload;

  console.log('📊 Processing reconciliation:', reconciliationId);

  try {
    await markReconciliationProcessing(reconciliationId);

    // Extract data from source files
    console.log('📄 Extracting source documents...');
    const sourceRecords: RecordToMatch[] = [];

    for (const fileKey of sourceFileKeys) {
      const textractJobId = await TextractService.startJob(fileKey, 'EXPENSE');
      await TextractService.waitForCompletion(textractJobId, 'EXPENSE');
      const textractResult = await TextractService.getFullResult(textractJobId, 'EXPENSE');

      const parsed = parseExpenseDocuments(textractResult);

      // Convert to RecordToMatch format
      parsed.lineItems.forEach((item, index) => {
        sourceRecords.push({
          id: `SRC-${fileKey}-${index}`,
          description: item.description,
          amount: item.amount,
          reference: parsed.invoiceNumber,
          date: parsed.invoiceDate,
        });
      });
    }

    // Extract data from target files
    console.log('📄 Extracting target documents...');
    const targetRecords: RecordToMatch[] = [];

    for (const fileKey of targetFileKeys) {
      const textractJobId = await TextractService.startJob(fileKey, 'EXPENSE');
      await TextractService.waitForCompletion(textractJobId, 'EXPENSE');
      const textractResult = await TextractService.getFullResult(textractJobId, 'EXPENSE');

      const parsed = parseExpenseDocuments(textractResult);

      // Convert to RecordToMatch format
      parsed.lineItems.forEach((item, index) => {
        targetRecords.push({
          id: `TGT-${fileKey}-${index}`,
          description: item.description,
          amount: item.amount,
          reference: parsed.invoiceNumber,
          date: parsed.invoiceDate,
        });
      });
    }

    console.log(`✅ Extracted ${sourceRecords.length} source records and ${targetRecords.length} target records`);

    // Perform reconciliation
    console.log('🔍 Matching records...');
    const matchResults = reconcileRecords(sourceRecords, targetRecords, {
      amountTolerance: 1, // 1% tolerance
      dateTolerance: 3, // 3 days tolerance
      fuzzyThreshold: 0.8, // 80% similarity
    });

    // Calculate statistics
    const matchedCount = matchResults.filter(r => r.matchType !== 'UNMATCHED').length;
    const unmatchedCount = matchResults.filter(r => r.matchType === 'UNMATCHED').length;
    const discrepancyCount = matchResults.filter(
      r => r.discrepancies && r.discrepancies.length > 0,
    ).length;

    console.log(`📊 Results: ${matchedCount} matched, ${unmatchedCount} unmatched, ${discrepancyCount} discrepancies`);

    // Generate Excel report
    console.log('📊 Generating Excel report...');
    const excelBuffer = await generateReconciliationExcel(matchResults, reconciliationType);

    // Upload to S3
    const outputKey = `reconciliation/result-${reconciliationId}.xlsx`;
    await uploadExcelToS3(excelBuffer, outputKey);

    // Update status
    await updateReconciliationStatus(reconciliationId, 'COMPLETED', {
      resultFileKey: outputKey,
      matchingResults: matchResults,
      matchedCount,
      unmatchedCount,
      discrepancyCount,
    });

    console.log(`✅ Reconciliation completed: ${outputKey}`);
  } catch (error: any) {
    console.error('❌ Reconciliation error:', error.message);

    await updateReconciliationStatus(reconciliationId, 'FAILED', {
      errorMessage: error.message,
    });

    throw error;
  }
}
