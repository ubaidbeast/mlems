'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSendInvitation } from '../api/use-send-invitation';

const sendInvitationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  isAdmin: z.boolean().default(false),
});

type SendInvitationFormValues = z.infer<typeof sendInvitationSchema>;

type SendInvitationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const SendInvitationDialog = ({
  open,
  onOpenChange,
}: SendInvitationDialogProps) => {
  const mutation = useSendInvitation();

  const form = useForm({
    resolver: zodResolver(sendInvitationSchema),
    defaultValues: {
      email: '',
      isAdmin: false,
    },
  });

  const onSubmit = async (values: SendInvitationFormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Invitation</DialogTitle>
          <DialogDescription>
            Send an invitation email to a new employee to join the system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="employee@example.com"
                      type="email"
                      disabled={mutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make this user an admin</FormLabel>
                    <FormDescription>
                      Admin users can invite other employees and manage departments.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
