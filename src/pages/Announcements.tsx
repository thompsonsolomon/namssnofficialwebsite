import { useEffect, useState } from 'react'
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Announcement } from '@/types'
import { formatDate, getRelativeTime } from '@/utils'
import toast from 'react-hot-toast'
import { Loader, Pin } from 'lucide-react'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const announcementsQuery = query(
          collection(db, 'announcements'),
          orderBy('isPinned', 'desc'),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(announcementsQuery)
        
        const now = new Date()
        const filtered = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Announcement))
          .filter(ann => !ann.expiresAt || new Date(ann.expiresAt) > now)
        
        setAnnouncements(filtered)
      } catch (error) {
        console.error('Error fetching announcements:', error)
        toast.error('Failed to load announcements')
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  const pinnedAnnouncements = announcements.filter(a => a.isPinned)
  const otherAnnouncements = announcements.filter(a => !a.isPinned)

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
      <div className="bg-secondary text-white py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Announcements</h1>
          <p className="text-lg text-white/90">Stay updated with the latest news and announcements</p>
        </div>
      </div>

      {/* Announcements */}
      <section className="container-custom py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Pinned Announcements */}
          {pinnedAnnouncements.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Pin size={24} className="text-accent" />
                Important Notices
              </h2>
              <div className="space-y-4">
                {pinnedAnnouncements.map(announcement => (
                  <div
                    key={announcement.id}
                    className="card border-l-4 border-accent p-6 bg-accent/5 hover:shadow-lg transition-shadow"
                  >
                    {announcement.image && (
                      <img
                        src={announcement.image}
                        alt={announcement.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-foreground flex-1">{announcement.title}</h3>
                      <Pin size={20} className="text-accent flex-shrink-0 ml-2" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-3">{announcement.content}</p>
                    <p className="text-sm text-muted-foreground">
                      {getRelativeTime(announcement.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Announcements */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Latest Updates</h2>
            {otherAnnouncements.length > 0 ? (
              <div className="space-y-4">
                {otherAnnouncements.map(announcement => (
                  <div
                    key={announcement.id}
                    className="card p-6 hover:shadow-lg transition-shadow"
                  >
                    {announcement.image && (
                      <img
                        src={announcement.image}
                        alt={announcement.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-lg font-bold text-foreground mb-2">{announcement.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">{announcement.content}</p>
                    <p className="text-sm text-muted-foreground">
                      {getRelativeTime(announcement.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 card p-8">
                <p className="text-muted-foreground text-lg">No announcements at this time.</p>
              </div>
            )}
          </div>

          {announcements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No announcements available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="container-custom mb-12">
        <div className="bg-primary text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-white/90 mb-6">Subscribe to our mailing list to receive updates directly</p>
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg focus:outline-none"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-white text-primary hover:bg-white/90 transition-colors font-medium"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
