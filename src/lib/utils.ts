import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User, { IUser } from "@/models/User";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get current user data including role from database
 */
export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if current user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.publicMetadata?.role === "admin";
}

/**
 * Check if current user has employee role
 */
export async function isEmployee(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.publicMetadata?.role === "employee";
}

/**
 * Check if current user has manager role
 */
export async function isManager(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.publicMetadata?.role === "manager";
}

/**
 * Get user role or return null if user not found
 */
export async function getUserRole(): Promise<
  "admin" | "employee" | "manager" | null
> {
  const user = await getCurrentUser();
  return user?.publicMetadata?.role || null;
}
