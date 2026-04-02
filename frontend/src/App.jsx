import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppLayout } from './components/layout/AppLayout'

import { LoginPage } from './components/auth/LoginPage'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { ProfilePage } from './components/profile/ProfilePage'
import { UnauthorizedPage } from './components/misc/UnauthorizedPage'
import { ResourcesPage } from './components/resources/ResourcesPage'
import { ResourceDetailsPage } from './components/resources/ResourceDetailsPage'
import { AddResourcePage } from './components/resources/AddResourcePage'
import { EditResourcePage } from './components/resources/EditResourcePage'
import { MyBookingsPage } from './components/bookings/MyBookingsPage'
import { CreateBookingPage } from './components/bookings/CreateBookingPage'
import { BookingDetailsPage } from './components/bookings/BookingDetailsPage'
import { ManageBookingsPage } from './components/bookings/ManageBookingsPage'
import { MyTicketsPage } from './components/tickets/MyTicketsPage'
import { CreateTicketPage } from './components/tickets/CreateTicketPage'
import { TicketDetailsPage } from './components/tickets/TicketDetailsPage'
import { ManageTicketsPage } from './components/tickets/ManageTicketsPage'
import { AssignedTicketsPage } from './components/tickets/AssignedTicketsPage'
import { NotificationsPage } from './components/notifications/NotificationsPage'
import { AdminDashboardPage } from './components/admin/AdminDashboardPage'
import { ManageUsersPage } from './components/admin/ManageUsersPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

function RoleProtectedRoute({ allow, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return allow.includes(user.role) ? <>{children}</> : <Navigate to="/unauthorized" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ResourcesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources/add"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allow={['ADMIN']}>
              <AppLayout>
                <AddResourcePage />
              </AppLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ResourceDetailsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources/:id/edit"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allow={['ADMIN']}>
              <AppLayout>
                <EditResourcePage />
              </AppLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MyBookingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/create"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CreateBookingPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <BookingDetailsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MyTicketsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/create"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CreateTicketPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TicketDetailsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NotificationsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allow={['ADMIN']}>
              <AppLayout>
                <AdminDashboardPage />
              </AppLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allow={['ADMIN']}>
              <AppLayout>
                <ManageBookingsPage />
              </AppLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allow={['ADMIN']}>
              <AppLayout>
                <ManageTicketsPage />
              </AppLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allow={['ADMIN']}>
              <AppLayout>
                <ManageUsersPage />
              </AppLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician/tickets"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allow={['TECHNICIAN']}>
              <AppLayout>
                <AssignedTicketsPage />
              </AppLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UnauthorizedPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

