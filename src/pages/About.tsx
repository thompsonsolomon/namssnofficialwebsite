import { useEffect, useState } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { StaffMember } from '@/types'
import toast from 'react-hot-toast'
import { Loader } from 'lucide-react'

export default function About() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffQuery = query(collection(db, 'staff'), orderBy('role', 'asc'))
        const snapshot = await getDocs(staffQuery)
        setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffMember)))
      } catch (error) {
        console.error('Error fetching staff:', error)
        toast.error('Failed to load staff information')
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [])

  const roles = Array.from(new Set(staff.map(s => s.role)))
  const filteredStaff = selectedRole ? staff.filter(s => s.role === selectedRole) : staff

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
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Our Department</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Learn about our history, mission, and the dedicated team that drives our success
          </p>
        </div>
      </div>

      {/* Mission & History */}
      <section className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Our department is committed to providing excellence in education, fostering innovation, and 
              preparing students for successful careers. We believe in creating an inclusive environment 
              where students can thrive academically and personally.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Through cutting-edge curriculum, dedicated faculty, and modern facilities, we prepare the 
              next generation of leaders and professionals.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Our History</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
            The Department of Mathematics is one of the seven (7) Departments established in the Faculty of Science of the University at inception in September 2011 with eleven (11) students who were admitted through UTME and Post-UTME.
Our mission is to offer qualitative research and teaching by constantly introducing new courses and options since Mathematics as well as other pure scientific endeavours underpin technology.



 
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
           The program also aims at bringing together the ingredients necessary for a well-paid career as required in the industries and other areas of the national economy aswell as relevant government establishments. Opportunities for the attainment of academic excellence through effective teaching and research in all aspects of AppliedMathematics are also provided.
The prominent feature of our program is the exposure of all intending B.Sc. Mathematics graduate to compulsory and elective courses in all areas of Mathematics and Statistics as well as other Science courses.
            </p>

              <p className="text-muted-foreground leading-relaxed">
       This is to ensure a high level of competence of our graduates and to increase their flexibility in fitting into diversecareers and industries. 
The Academic Programme is designedand/structured in line with the Nigerian University Commission (NUC) specification.
            </p>
          </div>
        </div>
      </section>

      {/* Key Achievements */}
      <section className="container-custom py-12 md:py-16 bg-muted/50">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Key Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <p className="text-foreground font-semibold">Alumni</p>
            <p className="text-muted-foreground text-sm mt-2">Making impact globally</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold text-secondary mb-2">95%</div>
            <p className="text-foreground font-semibold">Placement Rate</p>
            <p className="text-muted-foreground text-sm mt-2">Within first 6 months</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold text-accent mb-2">50+</div>
            <p className="text-foreground font-semibold">Research Papers</p>
            <p className="text-muted-foreground text-sm mt-2">Published annually</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold text-success mb-2">25+</div>
            <p className="text-foreground font-semibold">Industry Partners</p>
            <p className="text-muted-foreground text-sm mt-2">Collaboration opportunities</p>
          </div>
        </div>
      </section>

      {/* Staff Directory */}
      <section className="container-custom py-12 md:py-16">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Team</h2>

        {/* Role Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <button
            onClick={() => setSelectedRole(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRole === null
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            All ({staff.length})
          </button>
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedRole === role
                  ? 'bg-primary text-white'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {role} ({staff.filter(s => s.role === role).length})
            </button>
          ))}
        </div>

        {/* Staff Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map(member => (
            <div key={member.id} className="card overflow-hidden hover:shadow-lg transition-all">
              <img
                src={member.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'}
                alt={member.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                <p className="badge-primary mb-4">{member.role}</p>
                <p className="text-muted-foreground mb-4 line-clamp-4">{member.bio}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Email:</span>{' '}
                    <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                      {member.email}
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Phone:</span>{' '}
                    <a href={`tel:${member.phone}`} className="text-primary hover:underline">
                      {member.phone}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No staff members in this role yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}
