import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { isAdmin as isCurrentUserAdmin } from '@/lib/roles';

const invitations = new Hono();

// Schema for sending invitation
const sendInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  isAdmin: z.boolean().optional().default(false),
});

type SendInvitationRequest = z.infer<typeof sendInvitationSchema>;

invitations.post(
  '/send',
  clerkMiddleware(),
  zValidator('json', sendInvitationSchema),
  async (c) => {
    const auth = getAuth(c);

    // Only admins can send invitations
    if (!auth || !auth.userId) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    if (!isCurrentUserAdmin(auth.sessionClaims)) {
      throw new HTTPException(403, { message: 'Forbidden' });
    }

    const { email, isAdmin } = c.req.valid('json');
    const appUrlRaw = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const appUrl = appUrlRaw
      .replace(/^\/+(?=https?:\/\/)/, '')
      .replace(/\/+$/, '');
    const redirectUrl = appUrl ? `${appUrl}/sign-up` : undefined;

    try {
      const response = await fetch('https://api.clerk.com/v1/invitations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          public_metadata: isAdmin ? { role: 'admin' } : {},
          ...(redirectUrl ? { redirect_url: redirectUrl } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Clerk invitation error:', error);

        const clerkMessage =
          error?.errors?.[0]?.long_message ??
          error?.errors?.[0]?.message ??
          error?.message ??
          'Failed to send invitation';

        throw new HTTPException(400, {
          message: clerkMessage,
        });
      }

      const invitation = await response.json();

      return c.json({
        success: true,
        message: `Invitation sent to ${email}`,
        invitation,
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to send invitation' });
    }
  }
);

export default invitations;
