// Reconciliation Matching Engine
// Supports multiple matching algorithms

export interface RecordToMatch {
  id: string;
  description?: string;
  amount?: number;
  date?: string;
  reference?: string;
  [key: string]: any;
}

export interface MatchResult {
  sourceRecord: RecordToMatch;
  targetRecord?: RecordToMatch;
  matchType: 'EXACT' | 'FUZZY' | 'AMOUNT' | 'UNMATCHED';
  confidence: number;
  discrepancies?: string[];
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[len1][len2];
}

function similarityScore(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLen = Math.max(str1.length, str2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

// Date matching with tolerance
function datesMatch(date1?: string, date2?: string, toleranceDays: number = 3): boolean {
  if (!date1 || !date2) return false;

  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d1.getTime() - d2.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= toleranceDays;
  } catch {
    return false;
  }
}

// Amount matching with tolerance
function amountsMatch(amount1?: number, amount2?: number, tolerancePercent: number = 1): boolean {
  if (amount1 === undefined || amount2 === undefined) return false;
  if (amount1 === 0 && amount2 === 0) return true;

  const diff = Math.abs(amount1 - amount2);
  const avg = (Math.abs(amount1) + Math.abs(amount2)) / 2;
  const percentDiff = (diff / avg) * 100;

  return percentDiff <= tolerancePercent;
}

export function reconcileRecords(
  sourceRecords: RecordToMatch[],
  targetRecords: RecordToMatch[],
  options: {
    amountTolerance?: number; // percentage
    dateTolerance?: number; // days
    fuzzyThreshold?: number; // 0-1
  } = {},
): MatchResult[] {
  const results: MatchResult[] = [];
  const matchedTargetIds = new Set<string>();

  const amountTolerance = options.amountTolerance ?? 1;
  const dateTolerance = options.dateTolerance ?? 3;
  const fuzzyThreshold = options.fuzzyThreshold ?? 0.8;

  for (const sourceRecord of sourceRecords) {
    let bestMatch: { target: RecordToMatch; score: number; type: 'EXACT' | 'FUZZY' | 'AMOUNT' } | null = null;

    for (const targetRecord of targetRecords) {
      if (matchedTargetIds.has(targetRecord.id)) continue;

      // Try exact match on reference
      if (sourceRecord.reference && targetRecord.reference) {
        if (sourceRecord.reference === targetRecord.reference) {
          bestMatch = { target: targetRecord, score: 1.0, type: 'EXACT' };
          break;
        }
      }

      // Try fuzzy match on description
      if (sourceRecord.description && targetRecord.description) {
        const similarity = similarityScore(sourceRecord.description, targetRecord.description);
        if (similarity >= fuzzyThreshold) {
          if (!bestMatch || similarity > bestMatch.score) {
            bestMatch = { target: targetRecord, score: similarity, type: 'FUZZY' };
          }
        }
      }

      // Try amount + date match
      if (
        amountsMatch(sourceRecord.amount, targetRecord.amount, amountTolerance) &&
        datesMatch(sourceRecord.date, targetRecord.date, dateTolerance)
      ) {
        const score = 0.9;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { target: targetRecord, score, type: 'AMOUNT' };
        }
      }
    }

    if (bestMatch) {
      matchedTargetIds.add(bestMatch.target.id);

      // Check for discrepancies
      const discrepancies: string[] = [];

      if (sourceRecord.amount !== undefined && bestMatch.target.amount !== undefined) {
        if (!amountsMatch(sourceRecord.amount, bestMatch.target.amount, 0.01)) {
          discrepancies.push(
            `Amount mismatch: ${sourceRecord.amount} vs ${bestMatch.target.amount}`,
          );
        }
      }

      if (sourceRecord.date && bestMatch.target.date) {
        if (!datesMatch(sourceRecord.date, bestMatch.target.date, 0)) {
          discrepancies.push(`Date mismatch: ${sourceRecord.date} vs ${bestMatch.target.date}`);
        }
      }

      results.push({
        sourceRecord,
        targetRecord: bestMatch.target,
        matchType: bestMatch.type,
        confidence: bestMatch.score,
        discrepancies: discrepancies.length > 0 ? discrepancies : undefined,
      });
    } else {
      // Unmatched
      results.push({
        sourceRecord,
        matchType: 'UNMATCHED',
        confidence: 0,
      });
    }
  }

  // Add unmatched target records
  for (const targetRecord of targetRecords) {
    if (!matchedTargetIds.has(targetRecord.id)) {
      results.push({
        sourceRecord: { id: 'N/A', description: 'No source match' },
        targetRecord,
        matchType: 'UNMATCHED',
        confidence: 0,
      });
    }
  }

  return results;
}
