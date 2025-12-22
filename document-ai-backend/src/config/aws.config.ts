export default () => ({
  aws: {
    region: process.env.AWS_REGION,
    s3Bucket: process.env.S3_BUCKET,
    sqsQueueUrl: process.env.SQS_QUEUE_URL,
  },
});
