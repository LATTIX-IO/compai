import { awsConfig } from './aws.config';

describe('awsConfig', () => {
  const originalEnv = {
    APP_AWS_REGION: process.env.APP_AWS_REGION,
    APP_AWS_ACCESS_KEY_ID: process.env.APP_AWS_ACCESS_KEY_ID,
    APP_AWS_SECRET_ACCESS_KEY: process.env.APP_AWS_SECRET_ACCESS_KEY,
    APP_AWS_BUCKET_NAME: process.env.APP_AWS_BUCKET_NAME,
    APP_AWS_ENDPOINT: process.env.APP_AWS_ENDPOINT,
  };

  afterEach(() => {
    process.env.APP_AWS_REGION = originalEnv.APP_AWS_REGION;
    process.env.APP_AWS_ACCESS_KEY_ID = originalEnv.APP_AWS_ACCESS_KEY_ID;
    process.env.APP_AWS_SECRET_ACCESS_KEY =
      originalEnv.APP_AWS_SECRET_ACCESS_KEY;
    process.env.APP_AWS_BUCKET_NAME = originalEnv.APP_AWS_BUCKET_NAME;
    process.env.APP_AWS_ENDPOINT = originalEnv.APP_AWS_ENDPOINT;
  });

  it('does not throw when AWS storage env vars are missing', () => {
    delete process.env.APP_AWS_REGION;
    delete process.env.APP_AWS_ACCESS_KEY_ID;
    delete process.env.APP_AWS_SECRET_ACCESS_KEY;
    delete process.env.APP_AWS_BUCKET_NAME;
    delete process.env.APP_AWS_ENDPOINT;

    expect(() => awsConfig()).not.toThrow();
    expect(awsConfig()).toEqual({
      enabled: false,
      region: 'us-east-1',
      accessKeyId: undefined,
      secretAccessKey: undefined,
      bucketName: undefined,
      endpoint: undefined,
    });
  });

  it('marks AWS storage as enabled when all required env vars are present', () => {
    process.env.APP_AWS_REGION = 'eu-west-1';
    process.env.APP_AWS_ACCESS_KEY_ID = 'key';
    process.env.APP_AWS_SECRET_ACCESS_KEY = 'secret';
    process.env.APP_AWS_BUCKET_NAME = 'bucket';
    process.env.APP_AWS_ENDPOINT = 'https://example.invalid';

    expect(awsConfig()).toEqual({
      enabled: true,
      region: 'eu-west-1',
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      bucketName: 'bucket',
      endpoint: 'https://example.invalid',
    });
  });
});