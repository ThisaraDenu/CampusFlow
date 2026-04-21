import React, { useCallback, useEffect, useState } from 'react'
import { SearchIcon, UserIcon, Trash2Icon, PencilIcon } from 'lucide-react'
import { usersApi } from '../../services/usersApi'
import { PageHeader } from '../shared/PageHeader'
import { EmptyState } from '../shared/EmptyState'
import { useAuth } from '../../context/AuthContext'

export function ManageUsersPage() {
  const { user: currentUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editAvatarFile, setEditAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setUsers(await usersApi.list())
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'TECHNICIAN':
        return 'bg-teal-100 text-teal-800 border-teal-200'
      case 'USER':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersApi.updateRole(userId, newRole)
      await load()
    } catch (e) {
      alert(e?.message || 'Could not update role')
    }
  }

  const canDeleteUser = (u) => {
    if (!currentUser) return false
    if (u.id === currentUser.id) return false
    if (u.role !== 'ADMIN') return true
    return !!currentUser.mainAdmin && !u.mainAdmin
  }

  const canEditRole = (u, roleValue) => {
    if (!currentUser) return false
    if (u.mainAdmin && roleValue !== 'ADMIN') return false
    if ((u.role === 'ADMIN' || roleValue === 'ADMIN') && !currentUser.mainAdmin) {
      return false
    }
    return true
  }

  const handleDelete = async (u) => {
    const ok = window.confirm(`Delete ${u.name} (${u.role})? This cannot be undone.`)
    if (!ok) return
    try {
      await usersApi.deleteUser(u.id)
      await load()
    } catch (e) {
      alert(e?.message || 'Could not delete user')
    }
  }

  const openEdit = (u) => {
    setEditingUser(u)
    setEditName(u.name || '')
    setEditEmail(u.email || '')
    setEditAvatarFile(null)
  }

  const closeEdit = () => {
    setEditingUser(null)
    setEditName('')
    setEditEmail('')
    setEditAvatarFile(null)
    setSaving(false)
  }

  const canEditProfile = (u) => {
    if (!currentUser) return false
    if (u.role !== 'ADMIN') return true
    return !!currentUser.mainAdmin
  }

  const handleSaveProfile = async () => {
    if (!editingUser) return
    setSaving(true)
    try {
      await usersApi.updateProfile(editingUser.id, { name: editName, email: editEmail })
      if (editAvatarFile) {
        await usersApi.uploadAvatar(editingUser.id, editAvatarFile)
      }
      await load()
      closeEdit()
    } catch (e) {
      setSaving(false)
      alert(e?.message || 'Could not update profile')
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Manage Users"
        subtitle="View and manage user accounts and roles."
      />

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-4 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-campus-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-campus-gray-500 py-12">Loading users…</p>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={UserIcon}
          title="No users found"
          description="Try adjusting your search query"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-campus-gray-50 border-b border-campus-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-campus-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-campus-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-campus-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-campus-gray-500 uppercase tracking-wider">
                    Member Since
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-campus-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-campus-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`
                          }
                          alt={u.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="font-medium text-campus-gray-900">
                          {u.name}
                        </span>
                        {u.mainAdmin ? (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                            Main admin
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-campus-gray-600">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full border ${getRoleBadgeColor(
                          u.role,
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-campus-gray-600">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          disabled={!canEditProfile(u)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm border ${
                            canEditProfile(u)
                              ? 'border-campus-gray-200 text-campus-gray-700 bg-white hover:bg-campus-gray-50'
                              : 'border-campus-gray-200 text-campus-gray-400 bg-campus-gray-50 cursor-not-allowed'
                          }`}
                        >
                          <PencilIcon className="w-4 h-4" />
                          Edit
                        </button>

                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-3 py-1 border border-campus-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="USER" disabled={!canEditRole(u, 'USER')}>
                            User
                          </option>
                          <option value="ADMIN" disabled={!canEditRole(u, 'ADMIN')}>
                            Admin
                          </option>
                          <option value="TECHNICIAN" disabled={!canEditRole(u, 'TECHNICIAN')}>
                            Technician
                          </option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          disabled={!canDeleteUser(u)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm border ${
                            canDeleteUser(u)
                              ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'
                              : 'border-campus-gray-200 text-campus-gray-400 bg-campus-gray-50 cursor-not-allowed'
                          }`}
                        >
                          <Trash2Icon className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingUser ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-campus-gray-200">
            <div className="p-5 border-b border-campus-gray-200">
              <h3 className="text-lg font-semibold text-campus-gray-900">Edit profile</h3>
              <p className="text-sm text-campus-gray-600">
                {editingUser.name} ({editingUser.role})
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-campus-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-campus-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-campus-gray-700 mb-1">
                  Avatar (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditAvatarFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              </div>
            </div>

            <div className="p-5 border-t border-campus-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-campus-gray-300 text-campus-gray-700 bg-white hover:bg-campus-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
