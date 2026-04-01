import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BuildingIcon, CheckCircleIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState('USER')

  const handleLogin = async () => {
    await login(selectedRole)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-campus-gray-50 flex">
      <div className="flex-1 bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center">
              <BuildingIcon className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">CampusOps Hub</h1>
              <p className="text-teal-300">Smart Campus Operations</p>
            </div>
          </div>
          <p className="text-lg text-campus-gray-200 mb-6">
            Streamline your university operations with our comprehensive
            management system.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
              <p className="text-campus-gray-200">
                Manage facility and asset bookings efficiently
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
              <p className="text-campus-gray-200">
                Track maintenance and incident reports in real-time
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
              <p className="text-campus-gray-200">
                Receive instant notifications on important updates
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-navy-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-campus-gray-600">
              Sign in to access your campus operations dashboard
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-campus-gray-700 mb-3">
                Select Role (Demo)
              </label>
              <div className="space-y-2">
                {['USER', 'ADMIN', 'TECHNICIAN'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedRole === role
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-campus-gray-200 hover:border-campus-gray-300'
                    }`}
                  >
                    <span className="font-medium text-campus-gray-900">
                      {role}
                    </span>
                    {selectedRole === role && (
                      <CheckCircleIcon className="w-5 h-5 text-teal-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <p className="text-xs text-center text-campus-gray-500 mt-6">
              This is a demo application. No actual authentication is performed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
