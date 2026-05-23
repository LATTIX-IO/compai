import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SetupLoadingStep } from './SetupLoadingStep';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock('@/components/ai-work-preview-authentic', () => ({
  AiWorkPreviewAuthentic: () => <div>AI preview</div>,
}));

describe('SetupLoadingStep', () => {
  beforeEach(() => {
    push.mockReset();
  });

  it('continues to onboarding instead of upgrade', () => {
    render(<SetupLoadingStep organizationId="org_1" />);

    fireEvent.click(screen.getByRole('button', { name: /continue setup/i }));

    expect(push).toHaveBeenCalledWith('/onboarding/org_1');
  });
});