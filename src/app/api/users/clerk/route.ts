import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

// GET /api/users/clerk - Get all users from Clerk
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const query = searchParams.get('query') || '';

    // Fetch users from Clerk
    const clerk = await clerkClient();
    const usersResponse = await clerk.users.getUserList({
      limit,
      offset,
      query: query || undefined,
      orderBy: '-created_at'
    });

    // Format the response data
    const formattedUsers = usersResponse.data.map(user => ({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      banned: user.banned,
      locked: user.locked,
      emailVerified: user.emailAddresses?.[0]?.verification?.status === 'verified',
      phoneNumber: user.phoneNumbers?.[0]?.phoneNumber || null,
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
      unsafeMetadata: user.unsafeMetadata
    }));

    return NextResponse.json({
      users: formattedUsers,
      totalCount: usersResponse.totalCount,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < usersResponse.totalCount
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching users from Clerk:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users from Clerk',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/users/clerk/[userId] - Get specific user by ID
export async function POST(request: NextRequest) {
  try {
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch specific user from Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    // Format the response data
    const formattedUser = {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      banned: user.banned,
      locked: user.locked,
      emailVerified: user.emailAddresses?.[0]?.verification?.status === 'verified',
      phoneNumber: user.phoneNumbers?.[0]?.phoneNumber || null,
      emailAddresses: user.emailAddresses,
      phoneNumbers: user.phoneNumbers,
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
      unsafeMetadata: user.unsafeMetadata,
      externalAccounts: user.externalAccounts
    };

    return NextResponse.json({ user: formattedUser }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user from Clerk',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
