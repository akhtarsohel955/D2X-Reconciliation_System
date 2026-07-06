import ExcelJS from 'exceljs';
import { MatchResult } from './matching.engine';

export async function generateReconciliationExcel(
  matchResults: MatchResult[],
  reconciliationType: string,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // ===== Sheet 1: Summary =====
  const summarySheet = workbook.addWorksheet('Summary');

  const matchedCount = matchResults.filter(r => r.matchType !== 'UNMATCHED').length;
  const unmatchedCount = matchResults.filter(r => r.matchType === 'UNMATCHED').length;
  const discrepancyCount = matchResults.filter(r => r.discrepancies && r.discrepancies.length > 0).length;

  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Count', key: 'count', width: 15 },
  ];

  summarySheet.addRow({ metric: 'Reconciliation Type', count: reconciliationType });
  summarySheet.addRow({ metric: 'Total Records', count: matchResults.length });
  summarySheet.addRow({ metric: 'Matched Records', count: matchedCount });
  summarySheet.addRow({ metric: 'Unmatched Records', count: unmatchedCount });
  summarySheet.addRow({ metric: 'Records with Discrepancies', count: discrepancyCount });

  summarySheet.getRow(1).font = { bold: true };

  // ===== Sheet 2: Matched Records =====
  const matchedSheet = workbook.addWorksheet('Matched');

  matchedSheet.columns = [
    { header: 'Source ID', key: 'sourceId', width: 20 },
    { header: 'Source Description', key: 'sourceDesc', width: 30 },
    { header: 'Source Amount', key: 'sourceAmount', width: 15 },
    { header: 'Source Date', key: 'sourceDate', width: 15 },
    { header: 'Target ID', key: 'targetId', width: 20 },
    { header: 'Target Description', key: 'targetDesc', width: 30 },
    { header: 'Target Amount', key: 'targetAmount', width: 15 },
    { header: 'Target Date', key: 'targetDate', width: 15 },
    { header: 'Match Type', key: 'matchType', width: 15 },
    { header: 'Confidence', key: 'confidence', width: 12 },
    { header: 'Discrepancies', key: 'discrepancies', width: 40 },
  ];

  matchResults
    .filter(r => r.matchType !== 'UNMATCHED')
    .forEach(result => {
      matchedSheet.addRow({
        sourceId: result.sourceRecord.id,
        sourceDesc: result.sourceRecord.description || '',
        sourceAmount: result.sourceRecord.amount || '',
        sourceDate: result.sourceRecord.date || '',
        targetId: result.targetRecord?.id || '',
        targetDesc: result.targetRecord?.description || '',
        targetAmount: result.targetRecord?.amount || '',
        targetDate: result.targetRecord?.date || '',
        matchType: result.matchType,
        confidence: `${Math.round(result.confidence * 100)}%`,
        discrepancies: result.discrepancies?.join('; ') || '',
      });
    });

  matchedSheet.getRow(1).font = { bold: true };

  // ===== Sheet 3: Unmatched Records =====
  const unmatchedSheet = workbook.addWorksheet('Unmatched');

  unmatchedSheet.columns = [
    { header: 'Source', key: 'source', width: 15 },
    { header: 'ID', key: 'id', width: 20 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Reference', key: 'reference', width: 20 },
  ];

  matchResults
    .filter(r => r.matchType === 'UNMATCHED')
    .forEach(result => {
      if (result.sourceRecord.id !== 'N/A') {
        unmatchedSheet.addRow({
          source: 'Source',
          id: result.sourceRecord.id,
          description: result.sourceRecord.description || '',
          amount: result.sourceRecord.amount || '',
          date: result.sourceRecord.date || '',
          reference: result.sourceRecord.reference || '',
        });
      }

      if (result.targetRecord) {
        unmatchedSheet.addRow({
          source: 'Target',
          id: result.targetRecord.id,
          description: result.targetRecord.description || '',
          amount: result.targetRecord.amount || '',
          date: result.targetRecord.date || '',
          reference: result.targetRecord.reference || '',
        });
      }
    });

  unmatchedSheet.getRow(1).font = { bold: true };

  // ===== Sheet 4: Discrepancies =====
  const discrepancySheet = workbook.addWorksheet('Discrepancies');

  discrepancySheet.columns = [
    { header: 'Source ID', key: 'sourceId', width: 20 },
    { header: 'Target ID', key: 'targetId', width: 20 },
    { header: 'Discrepancy Details', key: 'details', width: 60 },
  ];

  matchResults
    .filter(r => r.discrepancies && r.discrepancies.length > 0)
    .forEach(result => {
      discrepancySheet.addRow({
        sourceId: result.sourceRecord.id,
        targetId: result.targetRecord?.id || '',
        details: result.discrepancies?.join('; ') || '',
      });
    });

  discrepancySheet.getRow(1).font = { bold: true };

  // ===== Generate Excel Buffer =====
  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}
