import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Event } from '../types'
import { formatDate, getEventStatus } from '../utils'
import toast from 'react-hot-toast'
import { Loader, Calendar, MapPin, Users } from 'lucide-react'

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'future' | 'present' | 'past'>('all')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          orderBy('startDate', 'asc')
        )
        const snapshot = await getDocs(eventsQuery)
        const eventsData = snapshot.docs.map(doc => {
          const data = doc.data() as any
          return {
            id: doc.id,
            ...data,
            status: getEventStatus(data.startDate, data.endDate),
          } as Event
        })
        setEvents(eventsData)
      } catch (error) {
        console.error('Error fetching events:', error)
        toast.error('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents = activeTab === 'all'
    ? events
    : events.filter(e => e.status === activeTab)

  const counts = {
    all: events.length,
    future: events.filter(e => e.status === 'future').length,
    present: events.filter(e => e.status === 'present').length,
    past: events.filter(e => e.status === 'past').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="bg-background">
      {/* Page Header */}
      <div className="bg-accent text-white py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Events</h1>
          <p className="text-lg text-white/90">Join us for upcoming events and celebrations</p>
        </div>
      </div>

      {/* Tabs */}
      <section className="container-custom py-8">
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border">
          {(['all', 'future', 'present', 'past'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredEvents.map(event => (
            <Link
              key={event.id}
              to={`/events/${event.slug}`}
              className="card overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="relative">
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1540575467063-178f50002cro?w=400&h=300&fit=crop'}
                  alt={event.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
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
                      : 'Past'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  {event.capacity && (
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      <span>
                        {event.registeredCount}/{event.capacity} registered
                      </span>
                    </div>
                  )}
                </div>

                <button className="w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm">
                  View Details
                </button>
              </div>
            </Link>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No {activeTab} events yet.</p>
            <Link to="/announcements" className="text-primary hover:underline">
              Check announcements for updates
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
