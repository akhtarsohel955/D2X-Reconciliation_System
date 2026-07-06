import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { sqsClient } from './sqs.client';
import { markJobProcessing } from '../jobs/job.repository';
import { TextractService } from '../textract/textract.service';

import { parseHRDocument } from '../parsers/hr.parser';
import { generateHRExcel } from '../exporters/hr.excel.exporter';

import { parseExpenseDocuments } from '../parsers/expense.parser';
import { generateExpenseExcel } from '../exporters/excel.exporter';

import { uploadExcelToS3 } from '../storage/s3.service';
import { updateJobStatus } from '../jobs/job.repository';
import { processReconciliation } from '../reconciliation/reconciliation.processor';


const QUEUE_URL = process.env.SQS_QUEUE_URL!;

export async function pollQueue() {
  while (true) {
    const command = new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20, // long polling
    });

    const response = await sqsClient.send(command);

    if (!response.Messages || response.Messages.length === 0) {
      continue;
    }

    const message = response.Messages[0];
    const body = JSON.parse(message.Body!);

    console.log('📥 Received message:', body);

    try {
      // Check message type
      if (body.type === 'RECONCILIATION') {
        // Handle reconciliation message
        await processReconciliation({
          reconciliationId: body.reconciliationId,
          sourceFileKeys: body.sourceFileKeys,
          targetFileKeys: body.targetFileKeys,
          reconciliationType: body.reconciliationType,
        });
      } else {
        // Handle regular job message (backward compatible)
        const { jobId, inputFileKey, documentType } = body;

        await markJobProcessing(jobId);

      // 🔥 TEXTRACT FLOW STARTS
      const textractJobId = await TextractService.startJob(
        inputFileKey,
        documentType,
      );

      console.log(`🧠 Textract started: ${textractJobId}`);

      await TextractService.waitForCompletion(
        textractJobId,
        documentType,
      );

      const textractResult = await TextractService.getFullResult(
        textractJobId,
        documentType,
      );

      let excelBuffer: Buffer;
      let outputKey = `outputs/job-${jobId}.xlsx`;

      if (documentType === 'EXPENSE') {
        // -------- Expense Flow --------
        const parsedExpense = parseExpenseDocuments(textractResult);

        excelBuffer = await generateExpenseExcel(parsedExpense);

      } else if (documentType === 'HR') {
        // -------- HR Flow --------
        const parsedHR = parseHRDocument(textractResult);

        excelBuffer = await generateHRExcel(parsedHR);

      } else {
        throw new Error(`Unsupported document type: ${documentType}`);
      }

      // Upload Excel
      await uploadExcelToS3(excelBuffer, outputKey);

      // Mark job completed
      await updateJobStatus(jobId, 'COMPLETED', {
        outputFileKey: outputKey,
      });

      console.log(`✅ ${documentType} job completed: ${outputKey}`);
      }

      // Delete message from queue
      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle!,
        }),
      );
    } catch (err: any) {
      console.error('❌ Processing error:', err.message);
      throw err;
    }
  }
}
