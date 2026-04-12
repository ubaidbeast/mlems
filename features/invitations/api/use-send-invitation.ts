import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type SendInvitationRequest = {
  email: string;
  isAdmin: boolean;
};

export const useSendInvitation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: SendInvitationRequest) => {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          isAdmin: data.isAdmin,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send invitation');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });

  return mutation;
};
