interface AsyncOnboardingOptions {
  nodeEnv?: string;
  triggerSecretKey?: string;
}

export function shouldSkipAsyncOnboardingJobs({
  nodeEnv = process.env.NODE_ENV,
  triggerSecretKey = process.env.TRIGGER_SECRET_KEY,
}: AsyncOnboardingOptions = {}): boolean {
  return nodeEnv === 'development' && !triggerSecretKey;
}
