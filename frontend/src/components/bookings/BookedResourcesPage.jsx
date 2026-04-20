import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon, SearchIcon } from 'lucide-react'
import { bookingsApi } from '../../services/bookingsApi'
import { resourcesApi } from '../../services/resourcesApi'
import { PageHeader } from '../shared/PageHeader'
import { EmptyState } from '../shared/EmptyState'
import { useAuth } from '../../context/AuthContext'

export function BookedResourcesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ONGOING')
  const [searchQuery, setSearchQuery] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [editForm, setEditForm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [booked, res] = await Promise.all([
        bookingsApi.listBooked(),
        resourcesApi.list(),
      ])
      setBookings(booked)
      setResources(res)
    } catch {
      setBookings([])
      setResources([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resourceById = useMemo(() => {
    const m = new Map()
    for (const r of resources) m.set(r.id, r)
    return m
  }, [resources])

  const filteredByTab = useMemo(() => {
    const now = new Date()
    const isOngoing = (b) => {
      if (!b?.date || !b?.startTime || !b?.endTime) return false
      const start = new Date(`${b.date}T${String(b.startTime).slice(0, 8)}`)
      const end = new Date(`${b.date}T${String(b.endTime).slice(0, 8)}`)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
        return false
      return start.getTime() <= now.getTime() && now.getTime() < end.getTime()
    }

    switch (activeTab) {
      case 'ONGOING':
        return bookings.filter(isOngoing)
      case 'ALL':
      default:
        return bookings
    }
  }, [bookings, activeTab])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return filteredByTab
    return filteredByTab.filter((b) => {
      const r = resourceById.get(b.resourceId)
      const fields = [
        b.resourceName,
        r?.location,
        r?.type,
        r?.capacity,
        b.userName,
        b.date,
        b.startTime,
        b.endTime,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return fields.includes(q)
    })
  }, [filteredByTab, searchQuery, resourceById])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const d = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (d !== 0) return d
      return String(b.startTime || '').localeCompare(String(a.startTime || ''))
    })
  }, [filtered])

  const isAdmin = user?.role === 'ADMIN'

  const openEdit = (b) => {
    setSelected(b)
    setEditForm({
      date: b.date,
      startTime: (b.startTime || '').slice(0, 5),
      endTime: (b.endTime || '').slice(0, 5),
      attendees: b.attendees || 1,
      purpose: b.purpose || '',
    })
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!selected || !editForm) return
    try {
      await bookingsApi.adminUpdate(selected.id, {
        date: editForm.date,
        startTime:
          editForm.startTime?.length === 5
            ? `${editForm.startTime}:00`
            : editForm.startTime,
        endTime:
          editForm.endTime?.length === 5
            ? `${editForm.endTime}:00`
            : editForm.endTime,
        attendees: Number(editForm.attendees) || 1,
        purpose: editForm.purpose || '',
      })
      setEditOpen(false)
      setSelected(null)
      setEditForm(null)
      await load()
    } catch (e) {
      alert(e?.message || 'Could not update booking')
    }
  }

  const deleteBooking = async (b) => {
    const ok = window.confirm('Delete this approved booking?')
    if (!ok) return
    try {
      await bookingsApi.adminDelete(b.id)
      await load()
    } catch (e) {
      alert(e?.message || 'Could not delete booking')
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Booked Resources"
        subtitle="See all approved bookings so you can pick an available time."
      />

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 overflow-hidden mb-6">
        <div className="border-b border-campus-gray-200 flex overflow-x-auto">
          {[
            { id: 'ONGOING', label: 'Ongoing' },
            { id: 'ALL', label: 'All' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-campus-gray-500 hover:text-campus-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-campus-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by resource, user, date, or purpose..."
              className="w-full pl-10 pr-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-campus-gray-500 py-12">
          Loading bookings…
        </p>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title={
            activeTab === 'ONGOING' ? 'No ongoing bookings' : 'No approved bookings'
          }
          description={
            activeTab === 'ONGOING'
              ? 'There are no approved bookings happening right now.'
              : 'There are no approved bookings yet.'
          }
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((b) => (
            (() => {
              const r = resourceById.get(b.resourceId)
              return (
            <div
              key={b.id}
              onClick={() => navigate(`/bookings/${b.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  navigate(`/bookings/${b.id}`)
              }}
              className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-4 hover:border-teal-500 transition-colors cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {r?.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={b.resourceName}
                      className="w-14 h-14 rounded-lg object-cover border border-campus-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-campus-gray-100 border border-campus-gray-200 shrink-0" />
                  )}

                  <div className="min-w-0">
                    <p className="font-semibold text-campus-gray-900 truncate">
                      {b.resourceName}
                    </p>
                    <p className="text-sm text-campus-gray-600 truncate">
                      {r?.location || 'Unknown location'}
                      {r?.capacity ? ` • Capacity: ${r.capacity}` : ''}
                      {r?.type ? ` • ${String(r.type).replace(/_/g, ' ')}` : ''}
                    </p>

                    <p className="text-sm text-campus-gray-600 mt-2">
                      {b.date} • {b.startTime} - {b.endTime}
                    </p>
                    <p className="text-sm text-campus-gray-500 mt-1 truncate">
                      Booked by: {b.userName}
                      {b.attendees ? ` • Attendees: ${b.attendees}` : ''}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(b)
                      }}
                      className="px-3 py-1 border border-campus-gray-300 rounded-lg text-sm text-campus-gray-700 hover:bg-campus-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteBooking(b)
                      }}
                      className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
              )
            })()
          ))}
        </div>
      )}

      {isAdmin && editOpen && selected && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl border border-campus-gray-200 w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-campus-gray-900 mb-1">
              Edit approved booking
            </h3>
            <p className="text-sm text-campus-gray-600 mb-4">
              {selected.resourceName} • {selected.userName}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, date: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
              />
              <input
                type="time"
                value={editForm.startTime}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, startTime: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
              />
              <input
                type="time"
                value={editForm.endTime}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, endTime: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <input
                type="number"
                min={1}
                value={editForm.attendees}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, attendees: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
                placeholder="Attendees"
              />
              <input
                type="text"
                value={editForm.purpose}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, purpose: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
                placeholder="Purpose"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 text-campus-gray-700 hover:bg-campus-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

