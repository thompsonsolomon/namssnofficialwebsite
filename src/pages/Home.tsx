import { useEffect, useState } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { StaffMember, EditableCard } from '@/types'
import toast from 'react-hot-toast'
import { Loader } from 'lucide-react'

export default function Home() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [cards, setCards] = useState<EditableCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch staff members
        const staffQuery = query(collection(db, 'staff'), orderBy('order', 'asc'))
        const staffSnapshot = await getDocs(staffQuery)
        setStaff(staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffMember)))

        // Fetch editable cards
        const cardsQuery = query(collection(db, 'editableCards'), orderBy('order', 'asc'))
        const cardsSnapshot = await getDocs(cardsQuery)
        setCards(cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EditableCard)))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load content')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="bg-background">
      {/* Hero Banner */}
      <div className="relative h-96 md:h-[500px] bg-gradient-to-r from-primary to-secondary overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=500&fit=crop"
          alt="Department Banner"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Our Department</h1>
            <p className="text-lg md:text-xl text-white/90">Excellence in education and innovation</p>
          </div>
        </div>
      </div>

      {/* Editable Cards Section */}
      {cards.length > 0 && (
        <section className="container-custom py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map(card => (
              <div
                key={card.id}
                className="card p-6 hover:shadow-lg transition-all cursor-pointer"
              >
                {card.image && (
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-foreground mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-sm">{card.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Staff Section */}
      <section className="container-custom py-12 md:py-16 bg-muted/50">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-center">Our Team</h2>
          <p className="text-center text-muted-foreground">Meet the dedicated members of our department</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staff.map(member => (
            <div key={member.id} className="card overflow-hidden hover:shadow-lg transition-all">
              <img
                src={member.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'}
                alt={member.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                <p className="badge-primary mb-3 mt-2">{member.role}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{member.bio}</p>
                <div className="mt-4 space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Email:</span>{' '}
                    <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                      {member.email}
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Phone:</span>{' '}
                    <a href={`tel:${member.phone}`} className="text-primary hover:underline">
                      {member.phone}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {staff.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No staff members yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container-custom py-12 md:py-16">
        <div className="bg-primary text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Involved</h2>
          <p className="text-lg text-white/90 mb-8">
            Join us for upcoming events and be part of our community
          </p>
          <a href="/events" className="btn-primary inline-flex bg-white text-primary hover:bg-white/90">
            Explore Events
          </a>
        </div>
      </section>
    </div>
  )
}
