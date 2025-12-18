import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { sqsClient } from './sqs.client';
import { markJobProcessing } from '../jobs/job.repository';
import { TextractService } from '../textract/textract.service';
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

      console.log(
        `✅ Textract completed for job ${jobId}, blocks:`,
        textractResult.length,
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
