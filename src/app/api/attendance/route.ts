import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';

// GET /api/attendance - Get attendance records
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const clerkId = searchParams.get('clerkId') || userId;

    await connectDB();

    let query: any = { clerkId };
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1 });

    return NextResponse.json({ attendance }, { status: 200 });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/attendance - Create attendance record (check-in/check-out)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, notes } = body; // type: 'checkin' or 'checkout'

    await connectDB();

    // Get user from database
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Check if attendance record exists for today
    let attendance = await Attendance.findOne({
      clerkId: userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const now = new Date();

    if (type === 'checkin') {
      if (attendance && attendance.checkIn) {
        return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
      }

      if (!attendance) {
        attendance = new Attendance({
          userId: user._id,
          clerkId: userId,
          date: now,
          checkIn: now,
          status: 'present',
          notes
        });
      } else {
        attendance.checkIn = now;
        attendance.status = 'present';
        if (notes) attendance.notes = notes;
      }
    } else if (type === 'checkout') {
      if (!attendance || !attendance.checkIn) {
        return NextResponse.json({ error: 'Must check in first' }, { status: 400 });
      }

      if (attendance.checkOut) {
        return NextResponse.json({ error: 'Already checked out today' }, { status: 400 });
      }

      attendance.checkOut = now;
      
      // Calculate work hours
      const workHours = (now.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);
      attendance.workHours = Math.round(workHours * 100) / 100;
      
      if (notes) attendance.notes = notes;
    }

    await attendance.save();

    return NextResponse.json({ attendance }, { status: 200 });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
