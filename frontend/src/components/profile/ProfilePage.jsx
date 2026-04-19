import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MailIcon,
  ShieldIcon,
  CalendarIcon,
  LogOutIcon,
  PencilIcon,
  SaveIcon,
  XIcon,
  CameraIcon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../services/authApi'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  const fileRef = useRef(null)

  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [previewAvatar, setPreviewAvatar] = useState('')

  useEffect(() => {
    setName(user?.name || '')
    setEmail(user?.email || '')
    setPreviewAvatar('')
  }, [user?.id])

  const avatarSrc = useMemo(() => {
    return (
      previewAvatar ||
      user?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        user?.name || 'user',
      )}`
    )
  }, [previewAvatar, user?.avatar, user?.name])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-navy-900 to-navy-800" />

        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-16 mb-6">
            <img
              src={avatarSrc}
              alt={user?.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            />
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-white mb-1 drop-shadow">
                {user?.name}
              </h1>
              <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm font-medium rounded-full">
                {user?.role}
              </span>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setError('')
                    if (!file.type?.startsWith('image/')) {
                      setError('Please select an image file.')
                      return
                    }
                    if (file.size > 2 * 1024 * 1024) {
                      setError('Image too large (max 2MB).')
                      return
                    }

                    const localPreview = await new Promise((resolve) => {
                      const reader = new FileReader()
                      reader.onload = () => resolve(reader.result || '')
                      reader.onerror = () => resolve('')
                      reader.readAsDataURL(file)
                    })
                    if (typeof localPreview === 'string' && localPreview) {
                      setPreviewAvatar(localPreview)
                    }
                    setBusy(true)
                    try {
                      await authApi.uploadAvatar(file)
                      await refreshUser()
                      // Switch from local preview to the persisted avatar from backend.
                      setPreviewAvatar('')
                    } catch (err) {
                      setError(err?.message || 'Could not upload avatar.')
                      setPreviewAvatar('')
                    } finally {
                      setBusy(false)
                      if (fileRef.current) fileRef.current.value = ''
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-campus-gray-50 text-campus-gray-800 rounded-lg hover:bg-campus-gray-100 disabled:opacity-60"
                >
                  <CameraIcon className="w-4 h-4" />
                  Upload photo
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEditing((v) => !v)
                    setError('')
                    setName(user?.name || '')
                    setEmail(user?.email || '')
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60"
                >
                  <PencilIcon className="w-4 h-4" />
                  {editing ? 'Cancel edit' : 'Edit profile'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {editing && (
            <form
              className="mb-6 p-4 rounded-lg border border-campus-gray-200 bg-white"
              onSubmit={async (e) => {
                e.preventDefault()
                setError('')
                setBusy(true)
                try {
                  await authApi.updateProfile({ name, email })
                  await refreshUser()
                  setEditing(false)
                } catch (err) {
                  setError(err?.message || 'Could not update profile.')
                } finally {
                  setBusy(false)
                }
              }}
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-campus-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-campus-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Your name"
                    disabled={busy}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-campus-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-campus-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="you@example.com"
                    disabled={busy}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEditing(false)
                    setError('')
                    setName(user?.name || '')
                    setEmail(user?.email || '')
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-campus-gray-50 text-campus-gray-800 rounded-lg hover:bg-campus-gray-100 disabled:opacity-60"
                >
                  <XIcon className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60"
                >
                  <SaveIcon className="w-4 h-4" />
                  Save
                </button>
              </div>
            </form>
          )}

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

