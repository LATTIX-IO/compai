import { describe, expect, it } from 'bun:test';

import { buildS3ClientConfig } from './s3';

describe('buildS3ClientConfig', () => {
  it('returns null when required S3 client env vars are missing', () => {
    expect(
      buildS3ClientConfig({
        APP_AWS_ACCESS_KEY_ID: 'access-key',
        APP_AWS_SECRET_ACCESS_KEY: 'secret-key',
      }),
    ).toBeNull();
  });

  it('builds an S3 client config when credentials and region are present', () => {
    expect(
      buildS3ClientConfig({
        APP_AWS_REGION: 'us-east-1',
        APP_AWS_ACCESS_KEY_ID: 'access-key',
        APP_AWS_SECRET_ACCESS_KEY: 'secret-key',
        APP_AWS_ENDPOINT: 'https://s3.internal.example.com',
      }),
    ).toEqual({
      endpoint: 'https://s3.internal.example.com',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key',
      },
      forcePathStyle: true,
    });
  });
});