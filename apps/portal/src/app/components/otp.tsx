'use client';

import { authClient } from '@/app/lib/auth-client';
import { Button, Input, cn } from '@trycompai/design-system';
import { ArrowRight } from '@trycompai/design-system/icons';
import { Form, FormControl, FormField, FormItem } from '@trycompai/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { OtpForm } from './otp-form';

const formSchema = z.object({
  email: z.string().email(),
});

type Props = {
  className?: string;
  deviceAuthRedirect?: string;
};

export function OtpSignIn({ className, deviceAuthRedirect }: Props) {
  const [isLoading, setLoading] = useState(false);
  const [isSent, setSent] = useState(false);
  const [_email, setEmail] = useState<string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function handleSubmit({ email }: z.infer<typeof formSchema>) {
    setLoading(true);
    setEmail(email);

    const { data, error } = await authClient.emailOtp.sendVerificationOtp({
      email: email,
      type: 'sign-in',
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      setSent(false);
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  if (isSent) {
    return (
      <div className={cn('flex flex-col space-y-4', className)}>
        <OtpForm email={_email ?? ''} deviceAuthRedirect={deviceAuthRedirect} />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className={cn('flex flex-col space-y-4', className)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Your work email"
                    {...field}
                    autoFocus
                    autoCapitalize="false"
                    autoCorrect="false"
                    spellCheck="false"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="w-full [&>button]:h-[40px] [&>button]:w-full">
            <Button
              type="submit"
              loading={isLoading}
              iconRight={isLoading ? undefined : <ArrowRight size={16} />}
              disabled={isLoading}
            >
              Continue
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
