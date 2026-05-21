import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const awsConfigSchema = z.object({
  enabled: z.boolean(),
  region: z.string().default('us-east-1'),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  bucketName: z.string().optional(),
  endpoint: z.string().optional(),
});

export type AwsConfig = z.infer<typeof awsConfigSchema>;

export const awsConfig = registerAs('aws', (): AwsConfig => {
  const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.APP_AWS_BUCKET_NAME?.trim();
  const endpoint = process.env.APP_AWS_ENDPOINT?.trim();

  const config = {
    enabled: Boolean(accessKeyId && secretAccessKey && bucketName),
    region: process.env.APP_AWS_REGION || 'us-east-1',
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint,
  };

  return awsConfigSchema.parse(config);
});
