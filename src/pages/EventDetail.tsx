import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  increment,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Event } from '@/types'
import { formatDate, formatDateTime, getEventStatus } from '@/utils'
import { validateEmail, validatePhone } from '@/utils'
import toast from 'react-hot-toast'
import { Loader, ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react'

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    level: '',
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('slug', '==', slug)
        )
        const snapshot = await getDocs(eventsQuery)
        if (snapshot.empty) {
          toast.error('Event not found')
          navigate('/events')
          return
        }
        const eventData = snapshot.docs[0].data() as any
        eventData.id = snapshot.docs[0].id
        eventData.status = getEventStatus(eventData.startDate, eventData.endDate)
        setEvent(eventData as Event)
      } catch (error) {
        console.error('Error fetching event:', error)
        toast.error('Failed to load event')
        navigate('/events')
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchEvent()
  }, [slug, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!event) return

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email')
      return
    }
    if (!validatePhone(formData.phone)) {
      toast.error('Please enter a valid phone number')
      return
    }
    if (!formData.department.trim()) {
      toast.error('Please select a department')
      return
    }
    if (!formData.level.trim()) {
      toast.error('Please select your level')
      return
    }

    // Check capacity
    if (event.capacity && event.registeredCount >= event.capacity) {
      toast.error('Event is at full capacity')
      return
    }

    setFormSubmitting(true)
    try {
      // Add registration
      await addDoc(collection(db, 'event_registrations'), {
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        level: formData.level,
        createdAt: Timestamp.now(),
      })

      // Increment registered count
      const eventRef = doc(collection(db, 'events'), event.id)
      await updateDoc(eventRef, {
        registeredCount: increment(1),
      })

      setRegistered(true)
      toast.success('Registration successful!')
    } catch (error) {
      console.error('Error registering:', error)
      toast.error('Failed to register for event')
    } finally {
      setFormSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  if (!event) {
    return null
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white">
                ✓
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your registration for <strong>{event.title}</strong> has been confirmed. A confirmation email has been sent to <strong>{formData.email}</strong>.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-6 text-left">
              <p className="text-sm text-foreground mb-2">
                <strong>Event:</strong> {event.title}
              </p>
              <p className="text-sm text-foreground mb-2">
                <strong>Date:</strong> {formatDateTime(event.startDate)}
              </p>
              <p className="text-sm text-foreground">
                <strong>Location:</strong> {event.location}
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      {/* Back Button */}
      <div className="container-custom py-6">
        <Link to="/events" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft size={20} />
          Back to Events
        </Link>
      </div>

      {/* Event Header */}
      <div className="container-custom max-w-4xl mb-12">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178f50002c?w=1000&h=500&fit=crop'}
          alt={event.title}
          className="w-full h-96 object-cover rounded-lg mb-8"
        />

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{event.title}</h1>
            <span
              className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${
                event.status === 'future'
                  ? 'bg-primary'
                  : event.status === 'present'
                  ? 'bg-success'
                  : 'bg-muted-foreground'
              }`}
            >
              {event.status === 'future'
                ? 'Upcoming'
                : event.status === 'present'
                ? 'Happening Now'
                : 'Past Event'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-semibold text-foreground">{formatDateTime(event.startDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-semibold text-foreground">{formatDateTime(event.endDate)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold text-foreground">{event.location}</p>
                </div>
              </div>
              {event.capacity && (
                <div className="flex items-start gap-3">
                  <Users className="text-primary mt-1" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-semibold text-foreground">
                      {event.registeredCount}/{event.capacity} registered
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {event.capacity && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="container-custom max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Event Details */}
        <div className="lg:col-span-2">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">About This Event</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="text-xl font-bold text-foreground mb-6">Register Now</h3>
            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Arts">Arts</option>
                  <option value="Sciences">Sciences</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Level *</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select level</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={formSubmitting || (event.capacity ? event.registeredCount >= event.capacity : false)}
                className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {formSubmitting ? 'Registering...' : 'Register Now'}
              </button>
              {event.capacity && event.registeredCount >= event.capacity && (
                <p className="text-sm text-error text-center">Event is at full capacity</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
