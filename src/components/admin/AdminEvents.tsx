// import { useEffect, useState } from 'react'
// import {
//   collection,
//   query,
//   getDocs,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
//   orderBy,
//   Timestamp,
//   where,
// } from 'firebase/firestore'
// import { db } from '../../config/firebase'
// import { uploadToCloudinary } from '../../config/cloudinary'
// import { Event } from '../../types'
// import { formatDate, slugify, getEventStatus } from '../../utils'
// import toast from 'react-hot-toast'
// import { Edit, Trash2, Plus, Loader, Upload, X } from 'lucide-react'

// export default function AdminEvents() {
//   const [events, setEvents] = useState<Event[]>([])
//   const [loading, setLoading] = useState(true)
//   const [showForm, setShowForm] = useState(false)
//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [uploading, setUploading] = useState(false)
//   const [imagePreview, setImagePreview] = useState<string | null>(null)
//   const [registrations, setRegistrations] = useState<any[]>([])
//   const [loadingRegistrations, setLoadingRegistrations] = useState(false)
//   const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

//   const [formData, setFormData] = useState({
//     title: '',
//     slug: '',
//     description: '',
//     location: '',
//     startDate: '',
//     endDate: '',
//     image: '',
//     category: '',
//     capacity: 0,
//   })

//   useEffect(() => {
//     fetchEvents()
//   }, [])

//   const fetchEvents = async () => {
//     try {
//       const eventsQuery = query(collection(db, 'events'), orderBy('startDate', 'asc'))
//       const regiteredUsersQuery = query(collection(db, 'event_registrations'))
//       const snapshot = await getDocs(eventsQuery)
//       const registrationsSnapshot = await getDocs(regiteredUsersQuery)
//       const eventsList = snapshot.docs.map(doc => {
//         const data = doc.data() as any
//         return {
//           id: doc.id,
//           ...data,
//           status: getEventStatus(data.startDate, data.endDate),
//         } as Event
//       })

//       registrationsSnapshot.docs.forEach(regDoc => {
//         const regData = regDoc.data()
//         const eventIndex = eventsList.findIndex(e => e.id === regData.eventId)
//         if (eventIndex !== -1) {
//           eventsList[eventIndex].registeredCount = (eventsList[eventIndex].registeredCount || 0) + 1
//           console.log(eventIndex);
          
//         }
//       })
//       setEvents(eventsList)
//     } catch (error) {
//       console.error('Error fetching events:', error)
//       toast.error('Failed to load events')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchRegistrations = async (eventId: string) => {
//   setLoadingRegistrations(true)
//   try {
//     const q = query(
//       collection(db, "event_registrations"),
//       where("eventId", "==", eventId)
//     )

//     const snapshot = await getDocs(q)
//     const list = snapshot.docs.map(doc => doc.data())

//     setRegistrations(list)
//   } catch (err) {
//     console.error(err)
//     toast.error("Failed to load registrations")
//   } finally {
//     setLoadingRegistrations(false)
//   }
// }

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     setUploading(true)
//     try {
//       const imageUrl = await uploadToCloudinary(file)
//       setFormData(prev => ({ ...prev, image: imageUrl }))
//       setImagePreview(imageUrl)
//       toast.success('Image uploaded!')
//     } catch (error) {
//       console.error('Error uploading image:', error)
//       toast.error('Failed to upload image')
//     } finally {
//       setUploading(false)
//     }
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     let { name, value } = e.target
    
//     if (name === 'title') {
//       const newSlug = slugify(value)
//       setFormData(prev => ({
//         ...prev,
//         [name]: value,
//         slug: newSlug,
//       }))
//     } else if (name === 'capacity') {
//       setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }))
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
//       toast.error('Please fill in all required fields')
//       return
//     }

//     if (new Date(formData.startDate) >= new Date(formData.endDate)) {
//       toast.error('End date must be after start date')
//       return
//     }

//     try {
//       const eventData = {
//         title: formData.title,
//         slug: formData.slug || slugify(formData.title),
//         description: formData.description,
//         location: formData.location,
//         startDate: Timestamp.fromDate(new Date(formData.startDate)),
//         endDate: Timestamp.fromDate(new Date(formData.endDate)),
//         image: formData.image,
//         category: formData.category,
//         capacity: formData.capacity || null,
//         registeredCount: editingId ? events.find(e => e.id === editingId)?.registeredCount || 0 : 0,
//       }

//       if (editingId) {
//         await updateDoc(doc(db, 'events', editingId), {
//           ...eventData,
//           updatedAt: Timestamp.now(),
//         })
//         toast.success('Event updated!')
//       } else {
//         await addDoc(collection(db, 'events'), {
//           ...eventData,
//           createdAt: Timestamp.now(),
//           updatedAt: Timestamp.now(),
//         })
//         toast.success('Event added!')
//       }

//       setFormData({
//         title: '',
//         slug: '',
//         description: '',
//         location: '',
//         startDate: '',
//         endDate: '',
//         image: '',
//         category: '',
//         capacity: 0,
//       })
//       setImagePreview(null)
//       setEditingId(null)
//       setShowForm(false)
//       fetchEvents()
//     } catch (error) {
//       console.error('Error saving event:', error)
//       toast.error('Failed to save event')
//     }
//   }

//   const handleEdit = (event: Event) => {
//     setFormData({
//       title: event.title,
//       slug: event.slug,
//       description: event.description,
//       location: event.location,
//       startDate: event.startDate instanceof Timestamp ? event.startDate.toDate().toISOString() : new Date(event.startDate).toISOString(),
//       endDate: event.endDate instanceof Timestamp ? event.endDate.toDate().toISOString() : new Date(event.endDate).toISOString(),
//       image: event.image,
//       category: event.category,
//       capacity: event.capacity || 0,
//     })
//     setImagePreview(event.image)
//     setEditingId(event.id)
//     setShowForm(true)
//   }

//   const handleDelete = async (id: string) => {
//     if (!window.confirm('Are you sure?')) return

//     try {
//       await deleteDoc(doc(db, 'events', id))
//       toast.success('Event deleted!')
//       fetchEvents()
//     } catch (error) {
//       console.error('Error deleting event:', error)
//       toast.error('Failed to delete event')
//     }
//   }

//   const handleCancel = () => {
//     setShowForm(false)
//     setEditingId(null)
//     setImagePreview(null)
//     setFormData({
//       title: '',
//       slug: '',
//       description: '',
//       location: '',
//       startDate: '',
//       endDate: '',
//       image: '',
//       category: '',
//       capacity: 0,
//     })
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <Loader className="animate-spin" size={32} />
//       </div>
//     )
//   }

// return (
//   <>
//     <div>
//       <div className="flex justify-between items-center mb-8">
//         <h2 className="text-2xl font-bold text-foreground">Event Management</h2>
//         {!showForm && (
//           <button
//             onClick={() => setShowForm(true)}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
//           >
//             <Plus size={18} />
//             Add Event
//           </button>
//         )}
//       </div>

//       {/* FORM */}
//       {showForm && (
//         <div className="card p-8 mb-8">
//           {/* KEEP YOUR FORM HERE (unchanged) */}
//         </div>
//       )}

//       {/* TABLE */}
//       <div className="card overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-muted border-b border-border">
//               <tr>
//                 <th className="px-6 py-3 text-left">Title</th>
//                 <th className="px-6 py-3 text-left">Date</th>
//                 <th className="px-6 py-3 text-left">Location</th>
//                 <th className="px-6 py-3 text-left">Status</th>
//                 <th className="px-6 py-3 text-left">Registered</th>
//                 <th className="px-6 py-3 text-left">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {events.map(event => (
//                 <tr key={event.id} className="border-t border-border">
//                   <td className="px-6 py-4">{event.title}</td>
//                   <td className="px-6 py-4">{formatDate(event.startDate)}</td>
//                   <td className="px-6 py-4">{event.location}</td>

//                   {/* STATUS */}
//                   <td className="px-6 py-4">
//                     <span className="badge">
//                       <span className={`badge text-xs ${event.status === 'future' ? 'badge-primary' : event.status === 'present' ? 'badge-success' : 'badge-warning'}`}>
//                      {event.status === 'future' ? 'Upcoming' : event.status === 'present' ? 'Happening' : 'Past'}
//                   </span>
//                     </span>
//                   </td>

//                   {/* REGISTER COUNT */}
//                   <td className="px-6 py-4">
//                     {event.registeredCount || 0}
//                   </td>

//                   {/* ACTIONS */}
//                   <td className="px-6 py-4">
//                     <div className="flex gap-2">

//                       {/* VIEW REGISTRATIONS */}
//                       <button
//                         onClick={() => {
//                           setSelectedEvent(event)
//                           fetchRegistrations(event.id)
//                         }}
//                         className="px-2 py-1 text-xs border rounded"
//                       >
//                         View
//                       </button>

//                       <button
//                         onClick={() => handleEdit(event)}
//                         className="p-2 border rounded"
//                       >
//                         <Edit size={16} />
//                       </button>

//                       <button
//                         onClick={() => handleDelete(event.id)}
//                         className="p-2 border text-red-500"
//                       >
//                         <Trash2 size={16} />
//                       </button>

//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>

//     {/* ✅ MODAL INSIDE SAME RETURN */}
//     {selectedEvent && (
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//         <div className="bg-background w-full max-w-3xl rounded-xl p-6">

//           <div className="flex justify-between mb-4">
//             <h3 className="text-xl font-bold">
//               {selectedEvent.title} Registrations
//             </h3>
//             <button onClick={() => setSelectedEvent(null)}>✕</button>
//           </div>

//           {loadingRegistrations ? (
//             <div className="flex justify-center py-6">
//               <Loader className="animate-spin" />
//             </div>
//           ) : registrations.length === 0 ? (
//             <p className="text-center text-muted-foreground">
//               No registrations yet
//             </p>
//           ) : (
//             <table className="w-full">
//               <thead className="bg-muted">
//                 <tr>
//                   <th className="p-2">Name</th>
//                   <th className="p-2">Email</th>
//                   <th className="p-2">Phone</th>
//                   <th className="p-2">Dept</th>
//                   <th className="p-2">Level</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {registrations.map((user, i) => (
//                   <tr key={i} className="border-t">
//                     <td className="p-2">{user.name}</td>
//                     <td className="p-2">{user.email}</td>
//                     <td className="p-2">{user.phone}</td>
//                     <td className="p-2">{user.department}</td>
//                     <td className="p-2">{user.level}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     )}
//   </>
// )



// }





import { useEffect, useState } from 'react'
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import { uploadToCloudinary } from '../../config/cloudinary'
import { Event } from '../../types'
import { formatDate, slugify, getEventStatus } from '../../utils'
import toast from 'react-hot-toast'
import { Edit, Trash2, Plus, Loader, Upload, X } from 'lucide-react'

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [filteredRegistrations, setFilteredRegistrations] = useState<any[]>([])

  const [search, setSearch] = useState('')


  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    image: '',
    category: '',
    capacity: 0,
  })

  useEffect(() => {
    fetchEvents()
  }, [])

   useEffect(() => {
    if (!search) {
      setFilteredRegistrations(registrations)
    } else {
      const filtered = registrations.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.department?.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredRegistrations(filtered)
    }
  }, [search, registrations])


  const fetchEvents = async () => {
    try {
      const eventsQuery = query(collection(db, 'events'), orderBy('startDate', 'asc'))
      const regiteredUsersQuery = query(collection(db, 'event_registrations'))
      const snapshot = await getDocs(eventsQuery)
      const registrationsSnapshot = await getDocs(regiteredUsersQuery)
      const eventsList = snapshot.docs.map(doc => {
        const data = doc.data() as any
        return {
          id: doc.id,
          ...data,
          status: getEventStatus(data.startDate, data.endDate),
        } as Event
      })

      registrationsSnapshot.docs.forEach(regDoc => {
        const regData = regDoc.data()
        const eventIndex = eventsList.findIndex(e => e.id === regData.eventId)
        if (eventIndex !== -1) {
          eventsList[eventIndex].registeredCount = (eventsList[eventIndex].registeredCount || 0) + 1
          console.log(eventIndex);
          
        }
      })
      setEvents(eventsList)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

 const fetchRegistrations = async (eventId: string) => {
    setLoadingRegistrations(true)
    try {
      const q = query(
        collection(db, 'event_registrations'),
        where('eventId', '==', eventId)
      )

      const snap = await getDocs(q)
      const data = snap.docs.map(doc => doc.data())

      setRegistrations(data)
      setFilteredRegistrations(data)
    } catch (err) {
      toast.error('Failed to load registrations')
    } finally {
      setLoadingRegistrations(false)
    }
  }

  // ✅ EXPORT CSV
  const exportToCSV = () => {
    if (!registrations.length) return

    const headers = ['Name', 'Email', 'Phone', 'Department', 'Level']
    const rows = registrations.map(u => [
      u.name,
      u.email,
      u.phone,
      u.department,
      u.level
    ])

    const csv =
      [headers, ...rows]
        .map(row => row.join(','))
        .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedEvent?.title}-registrations.csv`
    a.click()
  }

  // ✅ ATTENDANCE SHEET (PRINT)
  const downloadAttendance = () => {
    const win = window.open('', '_blank')

    if (!win) return

    win.document.write(`
      <html>
        <head>
          <title>${selectedEvent?.title} Attendance</title>
        </head>
        <body>
          <h2>${selectedEvent?.title} Attendance Sheet</h2>
          <table border="1" cellpadding="10">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Level</th>
              <th>Signature</th>
            </tr>
            ${registrations.map(u => `
              <tr>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.phone}</td>
                <td>${u.department}</td>
                <td>${u.level}</td>
                <td></td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `)

    win.print()
  }


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const imageUrl = await uploadToCloudinary(file)
      setFormData(prev => ({ ...prev, image: imageUrl }))
      setImagePreview(imageUrl)
      toast.success('Image uploaded!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target
    
    if (name === 'title') {
      const newSlug = slugify(value)
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: newSlug,
      }))
    } else if (name === 'capacity') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date')
      return
    }

    try {
      const eventData = {
        title: formData.title,
        slug: formData.slug || slugify(formData.title),
        description: formData.description,
        location: formData.location,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        image: formData.image,
        category: formData.category,
        capacity: formData.capacity || null,
        registeredCount: editingId ? events.find(e => e.id === editingId)?.registeredCount || 0 : 0,
      }

      if (editingId) {
        await updateDoc(doc(db, 'events', editingId), {
          ...eventData,
          updatedAt: Timestamp.now(),
        })
        toast.success('Event updated!')
      } else {
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
        toast.success('Event added!')
      }

      setFormData({
        title: '',
        slug: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        image: '',
        category: '',
        capacity: 0,
      })
      setImagePreview(null)
      setEditingId(null)
      setShowForm(false)
      fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
    }
  }

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      slug: event.slug,
      description: event.description,
      location: event.location,
      startDate: event.startDate instanceof Timestamp ? event.startDate.toDate().toISOString() : new Date(event.startDate).toISOString(),
      endDate: event.endDate instanceof Timestamp ? event.endDate.toDate().toISOString() : new Date(event.endDate).toISOString(),
      image: event.image,
      category: event.category,
      capacity: event.capacity || 0,
    })
    setImagePreview(event.image)
    setEditingId(event.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return

    try {
      await deleteDoc(doc(db, 'events', id))
      toast.success('Event deleted!')
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setImagePreview(null)
    setFormData({
      title: '',
      slug: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      image: '',
      category: '',
      capacity: 0,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <> 
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Event Management</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={18} />
            Add Event
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Event Title"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="event-slug"
                className="input-field bg-muted"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Event description..."
                rows={4}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Event location"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Workshop, Conference, etc."
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Date *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">End Date *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Capacity (leave 0 for unlimited)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="0"
                className="input-field"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Event Image</label>
              <div className="border border-dashed border-border rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-40 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setFormData(prev => ({ ...prev, image: '' }))
                      }}
                      className="absolute top-2 right-2 p-1 bg-error text-white rounded-full hover:bg-error/90"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={24} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
              >
                {editingId ? 'Update' : 'Add'} Event
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Reg Status</th>

                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">{event.title}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(event.startDate)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground line-clamp-1">{event.location}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`badge text-xs ${event.status === 'future' ? 'badge-primary' : event.status === 'present' ? 'badge-success' : 'badge-warning'}`}>
                      {event.status === 'future' ? 'Upcoming' : event.status === 'present' ? 'Happening' : 'Past'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                  {event.registeredCount}
                  </td>


                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">


                      <button
                    onClick={() => {
                      setSelectedEvent(event)
                      fetchRegistrations(event.id)
                    }}
                  >
                    View
                  </button>


                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 rounded-lg border border-error text-error hover:bg-error/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>


                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>


   {/* MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white w-full max-w-4xl p-6 rounded">

            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)}>✕</button>
            </div>

            {/* SEARCH */}
            <input
              placeholder="Search student..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border p-2 mb-4 w-full"
            />

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 mb-4">
              <button onClick={exportToCSV} className="border px-3 py-1">
                Export CSV
              </button>

              <button onClick={downloadAttendance} className="border px-3 py-1">
                Attendance Sheet
              </button>
            </div>

            {/* TABLE */}
            {loadingRegistrations ? (
              <Loader className="animate-spin" />
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Dept</th>
                    <th>Level</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRegistrations.map((u, i) => (
                    <tr key={i}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>{u.department}</td>
                      <td>{u.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>
      )}

    </>
  )

}


