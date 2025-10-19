import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/users - Get all users (admin only)
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create or update user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clerkId, email, firstName, lastName, role, department } = body;

    if (!clerkId || !email) {
      return NextResponse.json({ error: 'ClerkId and email are required' }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    let user = await User.findOne({ clerkId });

    if (user) {
      // Update existing user
      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      user.role = role || user.role;
      user.department = department;
      await user.save();
    } else {
      // Create new user
      user = new User({
        clerkId,
        email,
        firstName,
        lastName,
        role: role || 'employee',
        department,
      });
      await user.save();
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
