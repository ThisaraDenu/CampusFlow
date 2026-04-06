import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MailIcon, ShieldIcon, CalendarIcon, LogOutIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-navy-900 to-navy-800" />

        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-16 mb-6">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            />
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-navy-900 mb-1">
                {user?.name}
              </h1>
              <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm font-medium rounded-full">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-campus-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <MailIcon className="w-5 h-5 text-campus-gray-600" />
              </div>
              <div>
                <p className="text-sm text-campus-gray-600">Email</p>
                <p className="font-medium text-campus-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-campus-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <ShieldIcon className="w-5 h-5 text-campus-gray-600" />
              </div>
              <div>
                <p className="text-sm text-campus-gray-600">Role</p>
                <p className="font-medium text-campus-gray-900">{user?.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-campus-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-campus-gray-600" />
              </div>
              <div>
                <p className="text-sm text-campus-gray-600">Member Since</p>
                <p className="font-medium text-campus-gray-900">
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                    'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' },
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-campus-gray-200">
            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/')
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOutIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

