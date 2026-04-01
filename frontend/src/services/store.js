import {
  mockUsers,
  mockResources,
  mockBookings,
  mockTickets,
  mockNotifications,
} from '../data/mockData'

// Simple in-memory store so screens can mutate during UI-only phase.
export const store = {
  users: [...mockUsers],
  resources: [...mockResources],
  bookings: [...mockBookings],
  tickets: [...mockTickets],
  notifications: [...mockNotifications],
}

