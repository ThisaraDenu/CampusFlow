import React, { useState } from 'react'
import { SearchIcon, UserIcon } from 'lucide-react'
import { store } from '../../services/store'
import { PageHeader } from '../shared/PageHeader'
import { EmptyState } from '../shared/EmptyState'

export function ManageUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [, setVersion] = useState(0)

  const users = store.users

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const handleRoleChange = (userId, newRole) => {
    const idx = store.users.findIndex((u) => u.id === userId)
    if (idx !== -1) {
      store.users[idx] = { ...store.users[idx], role: newRole }
      setVersion((v) => v + 1)
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

      {filteredUsers.length === 0 ? (
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-campus-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="font-medium text-campus-gray-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-campus-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full border ${getRoleBadgeColor(
                          user.role,
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-campus-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="px-3 py-1 border border-campus-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="TECHNICIAN">Technician</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
