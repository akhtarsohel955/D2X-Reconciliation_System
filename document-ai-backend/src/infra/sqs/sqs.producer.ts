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
      MessageBody: JSON.stringify({ type: 'JOB', ...payload }),
    });

    await sqsClient.send(command);
  }

  static async sendReconciliationMessage(payload: {
    reconciliationId: string;
    sourceFileKeys: string[];
    targetFileKeys: string[];
    reconciliationType: string;
  }) {
    const command = new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      MessageBody: JSON.stringify({ type: 'RECONCILIATION', ...payload }),
    });

    await sqsClient.send(command);
  }
}
