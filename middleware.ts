import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher  } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/roles';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/webhooks(.*)']);
const isAdminRoute = createRouteMatcher(['/departments(.*)', '/categories(.*)']);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();

      if (isAdminRoute(req)) {
        const { sessionClaims } = await auth();

        if (!isAdmin(sessionClaims)) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
    }

    return NextResponse.next();
  })


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};