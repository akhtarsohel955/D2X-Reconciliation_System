import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { sqsClient } from './sqs.client';
import { markJobProcessing } from '../../modules/jobs/jobs.processor';

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
      // Step 1: mark job as PROCESSING
      await markJobProcessing(jobId);

      console.log(`✅ Job ${jobId} marked as PROCESSING`);

      // (Textract + Excel will go here later)

      // Step 2: delete message from queue
      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle!,
        }),
      );

      console.log(`🗑️ Message deleted for job ${jobId}`);
    } catch (err) {
      console.error('❌ Error processing job', err);
      // Message will reappear due to visibility timeout
    }
  }
}
