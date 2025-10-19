import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/users/sync - Sync users from Clerk to local database
export async function POST(request: NextRequest) {
  try {
    // Temporarily remove auth for testing
    // const { userId } = await auth();

    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await connectDB();

    // Fetch all users from Clerk
    const clerk = await clerkClient();
    const usersResponse = await clerk.users.getUserList({
      limit: 500, // Adjust limit as needed
    });

    const syncedUsers = [];
    const errors = [];

    // Process each user
    for (const clerkUser of usersResponse.data) {
      try {
        const userData = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
          fullname: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User',
          publicMetadata: {
            role: (clerkUser.publicMetadata as any)?.role || 'employee'
          }
        };

        // Check if user already exists
        const existingUser = await User.findOne({ id: clerkUser.id });

        if (existingUser) {
          // Update existing user - only update allowed fields
          await User.findOneAndUpdate(
            { id: clerkUser.id },
            {
              $set: {
                email: userData.email,
                fullname: userData.fullname,
                'publicMetadata.role': userData.publicMetadata.role
              }
            },
            { new: true }
          );
          syncedUsers.push({ ...userData, action: 'updated' });
        } else {
          // Create new user with only the required fields
          const newUser = new User(userData);
          await newUser.save();
          syncedUsers.push({ ...userData, action: 'created' });
        }
      } catch (userError) {
        console.error(`Error syncing user ${clerkUser.id}:`, userError);
        errors.push({
          userId: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress,
          error: userError instanceof Error ? userError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedUsers.length} users successfully`,
      syncedUsers,
      errors,
      totalProcessed: usersResponse.data.length,
      totalSynced: syncedUsers.length,
      totalErrors: errors.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error syncing users:', error);
    return NextResponse.json({
      error: 'Failed to sync users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/users/sync - Get sync status
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get total users in local database
    const totalLocalUsers = await User.countDocuments();

    // Get users from Clerk for comparison
    const clerk = await clerkClient();
    const clerkUsers = await clerk.users.getUserList({ limit: 500 });

    return NextResponse.json({
      localUsersCount: totalLocalUsers,
      clerkUsersCount: clerkUsers.totalCount,
      syncNeeded: totalLocalUsers !== clerkUsers.totalCount,
      lastSync: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json({
      error: 'Failed to get sync status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
