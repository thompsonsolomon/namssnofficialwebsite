// User Types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: Date
}

// Staff Types
export type StaffRole = 'advisor' | 'president' | 'deputy' | 'secretary' | 'treasurer' | 'member'

export interface StaffMember {
  id: string
  name: string
  role: StaffRole
  bio: string
  email: string
  phone: string
  image: string
  order: number
  createdAt: Date
  updatedAt: Date
}

// Blog Types
export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  author: string
  image: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  publishedAt: Date
}

export interface BlogComment {
  id: string
  postId: string
  author: string
  content: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

// Event Types
export type EventStatus = 'past' | 'present' | 'future'

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  location: string
  startDate: Date
  endDate: Date
  image: string
  category: string
  capacity?: number
  registeredCount: number
  status: EventStatus
  createdAt: Date
  updatedAt: Date
}

export interface EventRegistration {
  id: string
  eventId: string
  name: string
  email: string
  phone: string
  department: string
  level: string
  createdAt: Date
}

// Announcement Types
export interface Announcement {
  id: string
  title: string
  content: string
  image?: string
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

// Book Types
export interface Book {
  id: string
  title: string
  author: string
  description: string
  image: string
  fileUrl: string
  category: string
  downloadCount: number
  createdAt: Date
  updatedAt: Date
}

// Editable Card Types
export interface EditableCard {
  id: string
  title: string
  description: string
  image?: string
  order: number
  createdAt: Date
  updatedAt: Date
}
