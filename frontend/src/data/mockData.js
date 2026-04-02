export const mockUsers = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    role: 'USER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'admin-1',
    name: 'Michael Chen',
    email: 'michael.chen@university.edu',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'tech-1',
    name: 'David Martinez',
    email: 'david.martinez@university.edu',
    role: 'TECHNICIAN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    createdAt: '2024-01-12T08:00:00Z',
  },
]

export const mockResources = [
  {
    id: 'res-1',
    name: 'Main Lecture Hall A',
    type: 'LECTURE_HALL',
    capacity: 200,
    location: 'Building A, Floor 1',
    availabilityStart: '08:00',
    availabilityEnd: '18:00',
    status: 'ACTIVE',
    description:
      'Large lecture hall with modern AV equipment, projector, and sound system. Suitable for large classes and presentations.',
    imageUrl:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'res-2',
    name: 'Computer Lab 101',
    type: 'LABORATORY',
    capacity: 40,
    location: 'Building B, Floor 2',
    availabilityStart: '08:00',
    availabilityEnd: '20:00',
    status: 'ACTIVE',
    description:
      '40 workstations with latest software for programming and design courses. High-speed internet and dual monitors.',
    imageUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'res-3',
    name: 'Board Meeting Room',
    type: 'MEETING_ROOM',
    capacity: 15,
    location: 'Administration Building, Floor 3',
    availabilityStart: '09:00',
    availabilityEnd: '17:00',
    status: 'ACTIVE',
    description:
      'Executive meeting room with conference table, video conferencing equipment, and whiteboard.',
    imageUrl:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    createdAt: '2024-01-01T08:00:00Z',
  },
]

export const mockBookings = [
  {
    id: 'book-1',
    resourceId: 'res-1',
    resourceName: 'Main Lecture Hall A',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    date: '2024-04-15',
    startTime: '10:00',
    endTime: '12:00',
    purpose: 'Introduction to Computer Science - Lecture',
    attendees: 150,
    status: 'APPROVED',
    createdAt: '2024-03-20T10:30:00Z',
    updatedAt: '2024-03-21T09:15:00Z',
  },
  {
    id: 'book-2',
    resourceId: 'res-2',
    resourceName: 'Computer Lab 101',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    date: '2024-04-10',
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Web Development Workshop',
    attendees: 30,
    status: 'PENDING',
    createdAt: '2024-03-25T14:20:00Z',
    updatedAt: '2024-03-25T14:20:00Z',
  },
]

export const mockTickets = [
  {
    id: 'ticket-1',
    resourceId: 'res-2',
    resourceName: 'Computer Lab 101',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    category: 'IT_EQUIPMENT',
    priority: 'HIGH',
    description:
      'Several computers in the lab are not connecting to the network. Workstations 15-20 affected.',
    status: 'IN_PROGRESS',
    assignedTo: 'tech-1',
    assignedToName: 'David Martinez',
    attachments: [],
    createdAt: '2024-03-28T09:15:00Z',
    updatedAt: '2024-03-28T14:30:00Z',
  },
]

export const mockNotifications = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'BOOKING_APPROVED',
    title: 'Booking Approved',
    message:
      'Your booking for Main Lecture Hall A on April 15, 2024 has been approved.',
    isRead: false,
    relatedId: 'book-1',
    createdAt: '2024-03-21T09:15:00Z',
  },
]

