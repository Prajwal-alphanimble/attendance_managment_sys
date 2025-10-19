import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Attendance from '@/models/Attendance';

// User utilities
export async function createOrUpdateUser(userData: {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'employee' | 'manager';
  department?: string;
}) {
  await connectDB();
  
  let user = await User.findOne({ clerkId: userData.clerkId });
  
  if (user) {
    Object.assign(user, userData);
    await user.save();
  } else {
    user = new User(userData);
    await user.save();
  }
  
  return user;
}

export async function getUserByClerkId(clerkId: string) {
  await connectDB();
  return await User.findOne({ clerkId });
}

export async function getAllUsers() {
  await connectDB();
  return await User.find().sort({ createdAt: -1 });
}

// Attendance utilities
export async function getTodayAttendance(clerkId: string) {
  await connectDB();
  
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  return await Attendance.findOne({
    clerkId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });
}

export async function getAttendanceByDateRange(
  clerkId: string,
  startDate: Date,
  endDate: Date
) {
  await connectDB();
  
  return await Attendance.find({
    clerkId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 });
}

export async function getAttendanceStats(clerkId: string, month?: number, year?: number) {
  await connectDB();
  
  const currentDate = new Date();
  const targetMonth = month ?? currentDate.getMonth();
  const targetYear = year ?? currentDate.getFullYear();
  
  const startOfMonth = new Date(targetYear, targetMonth, 1);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
  
  const attendance = await Attendance.find({
    clerkId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  const stats = {
    totalDays: attendance.length,
    presentDays: attendance.filter(a => a.status === 'present').length,
    absentDays: attendance.filter(a => a.status === 'absent').length,
    lateDays: attendance.filter(a => a.status === 'late').length,
    halfDays: attendance.filter(a => a.status === 'half-day').length,
    totalWorkHours: attendance.reduce((sum, a) => sum + (a.workHours || 0), 0),
    averageWorkHours: 0
  };
  
  stats.averageWorkHours = stats.presentDays > 0 ? stats.totalWorkHours / stats.presentDays : 0;
  
  return stats;
}
