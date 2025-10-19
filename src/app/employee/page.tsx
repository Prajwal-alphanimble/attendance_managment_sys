import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, BarChart3, User, CheckCircle, XCircle } from 'lucide-react';
import { getCurrentUser, isEmployee } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function EmployeePage() {
  // Check if user is employee (or admin, as admins can access employee pages)
  const user = await getCurrentUser();
  const hasEmployeeAccess = await isEmployee();
  const isAdminUser = user?.role === 'admin';
  
  if (!user || (!hasEmployeeAccess && !isAdminUser)) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <User className="h-8 w-8 text-emerald-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Employee Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user.fullname || 'Employee'}
              </span>
              {isAdminUser && (
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Admin View
                </div>
              )}
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Your Employee Portal
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Track your attendance, view schedules, and manage your work time.
            </p>
          </div>

          {/* Clock In/Out Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Clock In/Out
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Status: <span className="font-semibold text-red-600">Clocked Out</span>
                </p>
              </div>
              <div className="flex space-x-3">
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Clock In
                </Button>
                <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                  <XCircle className="h-4 w-4 mr-2" />
                  Clock Out
                </Button>
              </div>
            </div>
          </div>

          {/* Employee Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    My Attendance
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View your attendance history
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    My Schedule
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View your work schedule
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Time Reports
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View your work time analytics
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    No recent clock-in activity
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Today's Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">--:--</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Hours Worked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">--:--</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Clock In Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">--:--</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Clock Out Time</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}