import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BuildingIcon, CheckCircleIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
<<<<<<< Updated upstream
import { store } from '../../services/store'
=======
import { fetchGoogleOAuthRedirectUrl } from '../../services/authApi'
>>>>>>> Stashed changes

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
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
  )
}

export function SignUpPage() {
  const navigate = useNavigate()
<<<<<<< Updated upstream
  const { register, login } = useAuth()
=======
  const { register } = useAuth()
>>>>>>> Stashed changes
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
<<<<<<< Updated upstream
=======
  const [googleBusy, setGoogleBusy] = useState(false)
>>>>>>> Stashed changes

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      await register({ name, email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Sign up failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError('')
<<<<<<< Updated upstream
    setSubmitting(true)
    try {
      const user = store.users.find((u) => u.role === 'USER')
      if (!user) throw new Error('Demo user unavailable')
      await login(user.email, 'password')
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Google sign-up failed')
    } finally {
      setSubmitting(false)
=======
    setGoogleBusy(true)
    try {
      const url = await fetchGoogleOAuthRedirectUrl()
      window.location.assign(url)
    } catch (err) {
      setError(err?.message || 'Could not start Google sign-in')
    } finally {
      setGoogleBusy(false)
>>>>>>> Stashed changes
    }
  }

  return (
    <div className="min-h-screen bg-campus-gray-50 flex">
      <div className="flex-1 bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center p-12">
        <div className="max-w-lg -translate-y-6 text-white md:-translate-y-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center">
              <BuildingIcon className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">CampusFlow</h1>
              <p className="text-teal-300">Smart Campus Operations</p>
            </div>
          </div>
          <p className="text-lg text-campus-gray-200 mb-6">
            Join your campus team—book spaces, report issues, and stay in the
            loop from day one.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
              <p className="text-campus-gray-200">
                One profile for bookings, tickets, and notifications
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
              <p className="text-campus-gray-200">
                Built for students, staff, and facilities teams
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
              <p className="text-campus-gray-200">
                Secure access tailored to your role
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to="/"
              className="text-sm font-medium text-teal-700 outline-none hover:text-teal-800 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              ← Back to home
            </Link>
            <span className="hidden text-campus-gray-300 sm:inline" aria-hidden>
              |
            </span>
            <p className="text-sm text-campus-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-teal-700 hover:text-teal-800 outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                Sign in
              </Link>
            </p>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-navy-900 mb-2">
              Create your account
            </h2>
            <p className="text-campus-gray-600">
              Enter your details to get started with campus operations
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-sm font-medium text-campus-gray-700 mb-2"
                >
                  Full name
                </label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-campus-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-campus-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-campus-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="you@gmail.com"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-campus-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-campus-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-confirm"
                  className="block text-sm font-medium text-campus-gray-700 mb-2"
                >
                  Confirm password
                </label>
                <input
                  id="signup-confirm"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-campus-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Re-enter your password"
                />
              </div>

              {error && (
                <p
                  className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:pointer-events-none"
              >
                {submitting ? 'Creating account…' : 'Create account'}
              </button>

              <div className="relative py-2">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden
                >
                  <span className="w-full border-t border-campus-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-white px-3 text-campus-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignUp}
<<<<<<< Updated upstream
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 border-2 border-campus-gray-200 bg-white text-campus-gray-800 py-3 rounded-lg font-medium hover:bg-campus-gray-50 transition-colors disabled:opacity-60 disabled:pointer-events-none"
              >
                <GoogleIcon />
                Sign up with Google
=======
                disabled={submitting || googleBusy}
                className="w-full flex items-center justify-center gap-2 border-2 border-campus-gray-200 bg-white text-campus-gray-800 py-3 rounded-lg font-medium hover:bg-campus-gray-50 transition-colors disabled:opacity-60 disabled:pointer-events-none"
              >
                <GoogleIcon />
                {googleBusy ? 'Redirecting…' : 'Sign up with Google'}
>>>>>>> Stashed changes
              </button>
            </form>

            <p className="text-xs text-center text-campus-gray-500 mt-6 leading-relaxed">
<<<<<<< Updated upstream
              Demo: accounts live in memory only (refresh may reset mock users).
              Sign in later with the same email and password you chose here.
              Pre-seeded accounts use password{' '}
              <span className="font-mono text-campus-gray-700">password</span>.
              Google uses the default mock USER account.
=======
              Use the same email and password to sign in later. For Google sign-in, configure
              GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the backend and add the redirect URI
              shown in any configuration error message to Google Cloud Console.
>>>>>>> Stashed changes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
