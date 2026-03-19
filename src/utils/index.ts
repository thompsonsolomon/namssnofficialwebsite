import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'

export const formatDate = (date: Date | any): string => {
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date)
    return format(dateObj, 'MMM dd, yyyy')
  } catch {
    return 'Invalid date'
  }
}

export const formatTime = (date: Date | any): string => {
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date)
    return format(dateObj, 'HH:mm')
  } catch {
    return 'Invalid time'
  }
}

export const formatDateTime = (date: Date | any): string => {
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date)
    return format(dateObj, 'MMM dd, yyyy HH:mm')
  } catch {
    return 'Invalid date'
  }
}

export const getRelativeTime = (date: Date | any): string => {
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date)
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch {
    return 'Unknown time'
  }
}

export const getEventStatus = (startDate: Date | any, endDate: Date | any): 'past' | 'present' | 'future' => {
  try {
    const start = startDate?.toDate ? startDate.toDate() : new Date(startDate)
    const end = endDate?.toDate ? endDate.toDate() : new Date(endDate)
    const now = new Date()

    if (isPast(end)) return 'past'
    if (isFuture(start)) return 'future'
    return 'present'
  } catch {
    return 'future'
  }
}

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const parseSlug = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{7,}$/
  return phoneRegex.test(phone)
}
