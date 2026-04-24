import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon, FilterIcon, MapPinIcon, PlusIcon } from 'lucide-react'
import { resourcesApi } from '../../services/resourcesApi'
import { bookingsApi } from '../../services/bookingsApi'
import { PageHeader } from '../shared/PageHeader'
import { EmptyState } from '../shared/EmptyState'

const toHHMM = (t) => String(t || '').slice(0, 5)

const overlaps = (aStart, aEnd, bStart, bEnd) =>
  String(aStart) < String(bEnd) && String(bStart) < String(aEnd)

function parseBuilding(location) {
  const s = String(location || '').trim()
  if (!s) return 'Unknown'
  // Common patterns: "Main building 5 th floor", "Engineering Building 13 th floor"
  const m = s.match(/^(.*?)(?:\s+floor|\s+level|$)/i)
  const head = (m?.[1] || s).trim()
  return head || 'Unknown'
}

function addMinutes(hhmm, minutes) {
  const [h, m] = String(hhmm).split(':').map((x) => Number(x))
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm
  const total = h * 60 + m + minutes
  const nh = Math.floor((total % (24 * 60)) / 60)
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function generateSlots(start, end, stepMinutes = 60) {
  const slots = []
  let cur = start
  while (String(cur) < String(end)) {
    const next = addMinutes(cur, stepMinutes)
    if (String(next) > String(end)) break
    slots.push({ start: cur, end: next })
    cur = next
  }
  return slots
}

export function ResourceAvailabilityCalendarPage() {
  const navigate = useNavigate()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [resources, setResources] = useState([])
  const [booked, setBooked] = useState([])
  const [loading, setLoading] = useState(true)

  const [building, setBuilding] = useState('ALL')
  const [type, setType] = useState('ALL')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [resList, bookedList] = await Promise.all([
        resourcesApi.list(),
        bookingsApi.listBooked(),
      ])
      setResources((resList || []).filter((r) => r.status === 'ACTIVE'))
      setBooked(bookedList || [])
    } catch {
      setResources([])
      setBooked([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const buildings = useMemo(() => {
    const set = new Set(resources.map((r) => parseBuilding(r.location)))
    return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [resources])

  const types = useMemo(() => {
    const set = new Set(resources.map((r) => String(r.type || 'UNKNOWN')))
    return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [resources])

  const bookingsForDate = useMemo(() => {
    return booked.filter((b) => String(b.date) === String(date))
  }, [booked, date])

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (building !== 'ALL' && parseBuilding(r.location) !== building) return false
      if (type !== 'ALL' && String(r.type || '') !== type) return false
      return true
    })
  }, [resources, building, type])

  const resourceRows = useMemo(() => {
    return filteredResources.map((r) => {
      const aStart = toHHMM(r.availabilityStart) || '08:00'
      const aEnd = toHHMM(r.availabilityEnd) || '18:00'
      const rBookings = bookingsForDate
        .filter((b) => b.resourceId === r.id)
        .map((b) => ({
          start: toHHMM(b.startTime),
          end: toHHMM(b.endTime),
          status: String(b.status),
          userName: b.userName,
        }))
        .sort((x, y) => String(x.start).localeCompare(String(y.start)))

      const candidateSlots = generateSlots(aStart, aEnd, 60)
      const freeSlots = candidateSlots.filter((s) => {
        // approved bookings block; we only receive approved from listBooked()
        return !rBookings.some((b) => overlaps(s.start, s.end, b.start, b.end))
      })

      return {
        resource: r,
        availability: { start: aStart, end: aEnd },
        bookings: rBookings,
        freeSlots,
      }
    })
  }, [filteredResources, bookingsForDate])

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Availability Calendar"
        subtitle="See availability by resource and book a slot in one click."
      />

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 text-sm text-campus-gray-700 font-medium">
          <CalendarIcon className="w-4 h-4 text-campus-gray-400" />
          Date
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />

        <div className="inline-flex items-center gap-2 text-sm text-campus-gray-700 font-medium ml-2">
          <FilterIcon className="w-4 h-4 text-campus-gray-400" />
          Filters
        </div>
        <select
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
          className="px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          {buildings.map((b) => (
            <option key={b} value={b}>
              {b === 'ALL' ? 'All buildings' : b}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === 'ALL' ? 'All categories' : String(t).replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={load}
          className="ml-auto px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-center text-campus-gray-500 py-12">Loading…</p>
      ) : resourceRows.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No resources found"
          description="Try adjusting your filters."
        />
      ) : (
        <div className="space-y-4">
          {resourceRows.map((row) => {
            const r = row.resource
            const buildingLabel = parseBuilding(r.location)
            const shownFree = row.freeSlots.slice(0, 3)
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-campus-gray-900">
                        {r.name}
                      </h3>
                      <span className="px-2 py-1 bg-campus-gray-100 rounded text-xs text-campus-gray-700">
                        {String(r.type || '').replace(/_/g, ' ') || 'RESOURCE'}
                      </span>
                      <span className="text-xs text-campus-gray-500">
                        {row.availability.start}–{row.availability.end}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-campus-gray-600">
                      <MapPinIcon className="w-4 h-4 text-campus-gray-400" />
                      <span className="truncate">
                        {buildingLabel} • {r.location}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/resources/${r.id}`)}
                    className="px-3 py-2 border border-campus-gray-300 rounded-lg text-sm text-campus-gray-700 hover:bg-campus-gray-50"
                  >
                    View resource
                  </button>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="bg-campus-gray-50 border border-campus-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-campus-gray-900 mb-2">
                      Booked (approved)
                    </p>
                    {row.bookings.length === 0 ? (
                      <p className="text-sm text-campus-gray-600">
                        No approved bookings on this date.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {row.bookings.slice(0, 5).map((b, idx) => (
                          <div
                            key={`${b.start}-${b.end}-${idx}`}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-campus-gray-700">
                              {b.start}–{b.end}
                            </span>
                            <span className="text-campus-gray-500 truncate max-w-[55%]">
                              {b.userName || 'Booked'}
                            </span>
                          </div>
                        ))}
                        {row.bookings.length > 5 && (
                          <p className="text-xs text-campus-gray-500">
                            +{row.bookings.length - 5} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-campus-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-campus-gray-900 mb-2">
                      Available slots
                    </p>
                    {shownFree.length === 0 ? (
                      <p className="text-sm text-campus-gray-600">
                        No free 1-hour slots within availability.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {shownFree.map((s) => (
                          <div
                            key={`${s.start}-${s.end}`}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="text-sm text-campus-gray-700">
                              {s.start}–{s.end}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/bookings/create?resourceId=${encodeURIComponent(
                                    r.id,
                                  )}&date=${encodeURIComponent(
                                    date,
                                  )}&startTime=${encodeURIComponent(
                                    s.start,
                                  )}&endTime=${encodeURIComponent(s.end)}`,
                                )
                              }
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                            >
                              <PlusIcon className="w-4 h-4" />
                              Book this slot
                            </button>
                          </div>
                        ))}
                        {row.freeSlots.length > shownFree.length && (
                          <p className="text-xs text-campus-gray-500">
                            Showing {shownFree.length} of {row.freeSlots.length}{' '}
                            free slots.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

