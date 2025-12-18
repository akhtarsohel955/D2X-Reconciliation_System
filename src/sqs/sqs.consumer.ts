import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { sqsClient } from './sqs.client';
import { markJobProcessing } from '../jobs/job.repository';
import { TextractService } from '../textract/textract.service';
import { generateExpenseExcel } from '../exporters/excel.exporter';
import { uploadExcelToS3 } from '../storage/s3.service';
import { updateJobStatus } from '../jobs/job.repository';

import { parseExpenseDocuments } from '../parsers/expense.parser'; // FOR TESTING OF PARSER ONLY NEED TO REMOVE IT IN PRODUCTION

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

    const { jobId, inputFileKey, documentType } = body;

    console.log('📥 Received job:', body);

    try {
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

      const parsedExpense = parseExpenseDocuments(textractResult); //  // FOR TESTING OF PARSER ONLY NEED TO REMOVE IT IN PRODUCTION
      const excelBuffer = await generateExpenseExcel(parsedExpense);

      const outputKey = `outputs/job-${jobId}.xlsx`;    /// S3 OUTPUTS directory

      await uploadExcelToS3(excelBuffer, outputKey);

      await updateJobStatus(jobId, 'COMPLETED', {
        outputFileKey: outputKey,
      });

      console.log(`📄 Excel generated and uploaded: ${outputKey}`);
      console.log(
        JSON.stringify(parsedExpense, null, 2),
      );

      // (Parsing + Excel will come next)

      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle!,
        }),
      );
    } catch (err: any) {
      console.error('❌ Textract error:', err.message);
      throw err;
    }
  }
}
