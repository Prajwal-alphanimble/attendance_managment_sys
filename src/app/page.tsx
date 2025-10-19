import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Clock, Users, Calendar, BarChart3 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/utils'

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Attendance Management System
              </h1>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Your Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Track attendance, manage schedules, and monitor productivity all in
              one place.
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Clock In/Out
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Track your time
                  </p>
                </div>
              </div>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                Clock In
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Schedule
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View your shifts
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Schedule
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Team
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage team members
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Team
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Reports
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View analytics
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Reports
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Your recent attendance records will appear here once you start
                clocking in.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center">
            <Clock className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Attendance Management System
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Sign in to track your attendance and manage your schedule
            </p>
            <div className="space-y-4">
              <SignInButton mode="modal">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Sign In to Continue
                </Button>
              </SignInButton>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Secure authentication powered by Clerk
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  // Check if user is authenticated and get their role
  const user = await getCurrentUser();
  
  // If user is authenticated, redirect them to their role-specific page
  if (user) {
    if (user.role === 'admin') {
      redirect('/admin');
    } else if (user.role === 'employee') {
      redirect('/employee');
    } else if (user.role === 'manager') {
      redirect('/manager'); // You can create this later
    }
  }

  // If not authenticated, show the sign-in page
  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <SignInPage />
      </SignedOut>
    </>
  );
}
