import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { completeOAuthSession } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const hash = window.location.hash?.startsWith('#')
          ? window.location.hash.slice(1)
          : ''
        const params = new URLSearchParams(hash)
        const token = params.get('token')
        if (!token) {
          setError('Missing token in callback URL.')
          return
        }
        await completeOAuthSession(token)
        window.history.replaceState(null, '', window.location.pathname)
        if (!cancelled) {
          navigate('/dashboard', { replace: true })
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Could not complete sign-in.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [completeOAuthSession, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-campus-gray-50 p-6">
      <div className="text-center max-w-md">
        {error ? (
          <>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="text-teal-700 font-medium hover:underline"
            >
              Back to login
            </button>
          </>
        ) : (
          <p className="text-campus-gray-600">Completing sign-in…</p>
        )}
      </div>
    </div>
  )
}
