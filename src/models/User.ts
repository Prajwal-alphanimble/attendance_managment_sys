import mongoose, { Document, Schema } from 'mongoose';

// User interface
export interface IUser extends Document {
  id: string; // Clerk user ID
  email: string;
  fullname: string;
  publicMetadata: {
    role: 'admin' | 'employee' | 'manager' | string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const UserSchema = new Schema<IUser>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  publicMetadata: {
    role: {
      type: String,
      enum: ['admin', 'employee', 'manager'],
      default: 'employee',
    },
  },
}, {
  timestamps: true,
});

// Create or recreate model to ensure updated schema is used
if (mongoose.models && (mongoose.models as any).User) {
  // Remove previously registered model to avoid old schema/validation
  delete (mongoose.models as any).User;
}

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
