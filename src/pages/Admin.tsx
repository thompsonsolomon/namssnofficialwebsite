import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Navigate } from 'react-router-dom'
import AdminStaff from '@/components/admin/AdminStaff'
import AdminEvents from '@/components/admin/AdminEvents'
import AdminAnnouncements from '@/components/admin/AdminAnnouncements'
import AdminBooks from '@/components/admin/AdminBooks'
import AdminCards from '@/components/admin/AdminCards'
import { LayoutDashboard, Users, Calendar, Bell, BookOpen, LayoutGrid } from 'lucide-react'

export default function Admin() {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'events' | 'announcements' | 'books' | 'cards'>('overview')

  // if (!isAdmin) {
  //   return <Navigate to="/" />
  // }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'cards', label: 'Cards', icon: LayoutGrid },
  ]

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-primary text-white py-6 border-b border-primary/20">
        <div className="container-custom">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-white/80 mt-1">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container-custom">
          <div className="flex overflow-x-auto gap-0">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 font-medium flex items-center gap-2 transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'staff' && <AdminStaff />}
        {activeTab === 'events' && <AdminEvents />}
        {activeTab === 'announcements' && <AdminAnnouncements />}
        {activeTab === 'books' && <AdminBooks />}
        {activeTab === 'cards' && <AdminCards />}
      </div>
    </div>
  )
}

function AdminOverview() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-8">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="card p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Staff</p>
          <p className="text-4xl font-bold text-primary">—</p>
        </div>
        <div className="card p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Events</p>
          <p className="text-4xl font-bold text-primary">—</p>
        </div>
        <div className="card p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Announcements</p>
          <p className="text-4xl font-bold text-primary">—</p>
        </div>
        <div className="card p-6">
          <p className="text-muted-foreground text-sm mb-2">Resources</p>
          <p className="text-4xl font-bold text-primary">—</p>
        </div>
      </div>
      <div className="card p-8">
        <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left">
            <p className="font-semibold text-foreground">Add Staff Member</p>
            <p className="text-sm text-muted-foreground">Create a new staff profile</p>
          </button>
          <button className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left">
            <p className="font-semibold text-foreground">Create Event</p>
            <p className="text-sm text-muted-foreground">Announce a new event</p>
          </button>
          <button className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left">
            <p className="font-semibold text-foreground">Add Announcement</p>
            <p className="text-sm text-muted-foreground">Post important news</p>
          </button>
          <button className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left">
            <p className="font-semibold text-foreground">Upload Resource</p>
            <p className="text-sm text-muted-foreground">Add books and materials</p>
          </button>
        </div>
      </div>
    </div>
  )
}
