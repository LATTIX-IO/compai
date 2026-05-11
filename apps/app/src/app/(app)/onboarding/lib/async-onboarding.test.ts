import { describe, expect, it } from 'vitest';
import { shouldSkipAsyncOnboardingJobs } from './async-onboarding';

describe('shouldSkipAsyncOnboardingJobs', () => {
  it('returns true in development when Trigger.dev is not configured', () => {
    expect(
      shouldSkipAsyncOnboardingJobs({
        nodeEnv: 'development',
        triggerSecretKey: '',
      }),
    ).toBe(true);
  });

  it('returns false in development when Trigger.dev is configured', () => {
    expect(
      shouldSkipAsyncOnboardingJobs({
        nodeEnv: 'development',
        triggerSecretKey: 'tr_dev_123',
      }),
    ).toBe(false);
  });

  it('returns false outside development even without Trigger.dev', () => {
    expect(
      shouldSkipAsyncOnboardingJobs({
        nodeEnv: 'production',
        triggerSecretKey: '',
      }),
    ).toBe(false);
  });
});
