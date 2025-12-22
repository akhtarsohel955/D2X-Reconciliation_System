import {
  StartExpenseAnalysisCommand,
  StartDocumentAnalysisCommand,
  GetExpenseAnalysisCommand,
  GetDocumentAnalysisCommand,
} from '@aws-sdk/client-textract';
import { textractClient } from './textract.client';

const BUCKET = process.env.S3_BUCKET!;

export class TextractService {
  // STEP 1: Start Textract job
  static async startJob(
    s3Key: string,
    documentType: 'EXPENSE' | 'HR',
  ): Promise<string> {
    if (documentType === 'EXPENSE') {
      const command = new StartExpenseAnalysisCommand({
        DocumentLocation: {
          S3Object: {
            Bucket: BUCKET,
            Name: s3Key,
          },
        },
      });

      const response = await textractClient.send(command);
      return response.JobId!;
    }

    // HR documents
    const command = new StartDocumentAnalysisCommand({
      DocumentLocation: {
        S3Object: {
          Bucket: BUCKET,
          Name: s3Key,
        },
      },
      FeatureTypes: ['FORMS', 'TABLES'],
    });

    const response = await textractClient.send(command);
    return response.JobId!;
  }

  // STEP 2: Poll for completion
  static async waitForCompletion(
    textractJobId: string,
    documentType: 'EXPENSE' | 'HR',
  ): Promise<void> {
    const maxAttempts = 10;
    const delayMs = 5000;

    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getJobStatus(textractJobId, documentType);

      if (status === 'SUCCEEDED') return;
      if (status === 'FAILED')
        throw new Error('Textract job failed');

      await new Promise((res) => setTimeout(res, delayMs));
    }

    throw new Error('Textract job timed out');
  }

  // STEP 3: Check job status
  private static async getJobStatus(
    jobId: string,
    documentType: 'EXPENSE' | 'HR',
  ): Promise<string> {
    if (documentType === 'EXPENSE') {
      const res = await textractClient.send(
        new GetExpenseAnalysisCommand({ JobId: jobId }),
      );
      return res.JobStatus!;
    }

    const res = await textractClient.send(
      new GetDocumentAnalysisCommand({ JobId: jobId }),
    );
    return res.JobStatus!;
  }

  // STEP 4: Fetch full result (paginated)
    static async getFullResult(
    textractJobId: string,
    documentType: 'EXPENSE' | 'HR',
    ) {
    let nextToken: string | undefined;

    // EXPENSE DOCUMENTS
    if (documentType === 'EXPENSE') {
        const expenseDocuments: any[] = [];

        do {
        const response = await textractClient.send(
            new GetExpenseAnalysisCommand({
            JobId: textractJobId,
            NextToken: nextToken,
            }),
        );

        if (response.ExpenseDocuments) {
            expenseDocuments.push(...response.ExpenseDocuments);
        }

        nextToken = response.NextToken;
        } while (nextToken);

        return expenseDocuments;
    }

    // HR / GENERIC DOCUMENTS
    const blocks: any[] = [];

    do {
        const response = await textractClient.send(
        new GetDocumentAnalysisCommand({
            JobId: textractJobId,
            NextToken: nextToken,
        }),
        );

        if (response.Blocks) {
        blocks.push(...response.Blocks);
        }

        nextToken = response.NextToken;
    } while (nextToken);

    return blocks;
    }
}
