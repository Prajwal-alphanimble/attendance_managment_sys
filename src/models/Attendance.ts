import mongoose, { Document, Schema } from 'mongoose';

// Attendance interface
export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'half-day';
  workHours?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Attendance schema
const AttendanceSchema = new Schema<IAttendance>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clerkId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present',
  },
  workHours: {
    type: Number,
    min: 0,
    max: 24,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ clerkId: 1, date: 1 });

// Create or use existing model
const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
