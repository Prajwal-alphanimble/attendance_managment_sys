import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Define route matchers
const isProtectedRoute = createRouteMatcher([
  '/admin/(.*)',
  '/employee/(.*)',
  '/dashboard/(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in/(.*)',
  '/sign-up/(.*)',
  '/api/webhooks/(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin/(.*)']);
const isEmployeeRoute = createRouteMatcher(['/employee/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // Allow public routes and webhook routes
  if (isPublicRoute(req) || pathname.startsWith('/api/webhooks/')) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access protected route
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If user is authenticated, check role-based access
  if (userId && isProtectedRoute(req)) {
    try {
      // Connect to database and get user role
      await connectDB();
      const user = await User.findOne({ clerkId: userId }).select('publicMetadata.role');

      if (!user) {
        // User not found in database, redirect to complete profile or sign out
        console.warn(`User with id ${userId} not found in database`);
        const signInUrl = new URL('/sign-in', req.url);
        return NextResponse.redirect(signInUrl);
      }

      const userRole = user.publicMetadata?.role;

      // Role-based routing logic
      if (isAdminRoute(req) && userRole !== 'admin') {
        // Non-admin trying to access admin routes
        if (userRole === 'employee') {
          return NextResponse.redirect(new URL('/employee', req.url));
        }
        // For other roles, redirect to appropriate page or show unauthorized
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }

      if (isEmployeeRoute(req) && userRole !== 'employee') {
        // Non-employee trying to access employee routes
        if (userRole === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
        // For other roles, redirect to appropriate page or show unauthorized
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }

      // Handle root route redirection based on role
      if (pathname === '/' && userId) {
        if (userRole === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url));
        } else if (userRole === 'employee') {
          return NextResponse.redirect(new URL('/employee', req.url));
        } else if (userRole === 'manager') {
          // You can add manager route later
          return NextResponse.redirect(new URL('/manager', req.url));
        }
      }

      // Allow access if role checks pass
      return NextResponse.next();

    } catch (error) {
      console.error('Error in middleware role check:', error);
      // In case of database error, allow access but log the error
      return NextResponse.next();
    }
  }

  // Default: allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};