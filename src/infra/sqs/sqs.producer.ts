import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from './sqs.client';

export class SqsProducer {
  static async sendJobMessage(payload: {
    jobId: string;
    inputFileKey: string;
    documentType: string;
  }) {
    const command = new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      MessageBody: JSON.stringify(payload),
    });

    await sqsClient.send(command);
  }
}
