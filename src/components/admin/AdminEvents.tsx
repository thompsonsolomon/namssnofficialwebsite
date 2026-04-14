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
import { Link } from 'react-router-dom'

export default function AdminEvents() {
  // const [events, setEvents] = useState<Event[]>([])
  // const [loading, setLoading] = useState(true)
  // const [showForm, setShowForm] = useState(false)
  // const [editingId, setEditingId] = useState<string | null>(null)
  // const [uploading, setUploading] = useState(false)
  // const [imagePreview, setImagePreview] = useState<string | null>(null)

  // const [registrations, setRegistrations] = useState<any[]>([])
  // const [filteredRegistrations, setFilteredRegistrations] = useState<any[]>([])
  // const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  // const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  // const [search, setSearch] = useState('')

  // const [formData, setFormData] = useState({
  //   title: '',
  //   slug: '',
  //   description: '',
  //   location: '',
  //   startDate: '',
  //   endDate: '',
  //   image: '',
  //   category: '',
  //   capacity: 0,

  //   host: {
  //     name: '',
  //     role: '',
  //     image: '',
  //   },

  //   speakers: [] as {
  //     name: string
  //     role: string
  //     image: string
  //   }[],
  // })

  // useEffect(() => {
  //   fetchEvents()
  // }, [])

  // useEffect(() => {
  //   if (!search) {
  //     setFilteredRegistrations(registrations)
  //   } else {
  //     const filtered = registrations.filter(user =>
  //       user.name?.toLowerCase().includes(search.toLowerCase()) ||
  //       user.email?.toLowerCase().includes(search.toLowerCase()) ||
  //       user.department?.toLowerCase().includes(search.toLowerCase())
  //     )
  //     setFilteredRegistrations(filtered)
  //   }
  // }, [search, registrations])

  // // ================= FETCH =================
  // const fetchEvents = async () => {
  //   try {
  //     const eventsQuery = query(collection(db, 'events'), orderBy('startDate', 'asc'))
  //     const regQuery = query(collection(db, 'event_registrations'))

  //     const snapshot = await getDocs(eventsQuery)
  //     const regSnapshot = await getDocs(regQuery)

  //     const eventsList = snapshot.docs.map(doc => {
  //       const data = doc.data() as any
  //       return {
  //         id: doc.id,
  //         ...data,
  //         status: getEventStatus(data.startDate, data.endDate),
  //       } as Event
  //     })

  //     regSnapshot.docs.forEach(regDoc => {
  //       const regData = regDoc.data()
  //       const index = eventsList.findIndex(e => e.id === regData.eventId)
  //       if (index !== -1) {
  //         eventsList[index].registeredCount =
  //           (eventsList[index].registeredCount || 0) + 1
  //       }
  //     })

  //     setEvents(eventsList)
  //   } catch {
  //     toast.error('Failed to load events')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // const fetchRegistrations = async (eventId: string) => {
  //   setLoadingRegistrations(true)
  //   try {
  //     const q = query(
  //       collection(db, 'event_registrations'),
  //       where('eventId', '==', eventId)
  //     )

  //     const snap = await getDocs(q)
  //     const data = snap.docs.map(doc => doc.data())
  //     console.log(data)
  //     setRegistrations(data)
  //     setFilteredRegistrations(data)
  //   } catch {
  //     toast.error('Failed to load registrations')
  //   } finally {
  //     setLoadingRegistrations(false)
  //   }
  // }

  // // ================= IMAGE UPLOAD (ONE FUNCTION) =================
  // const handleImageUpload = async (
  //   file: File,
  //   type: 'event' | 'host' | 'speaker',
  //   index?: number
  // ) => {
  //   if (!file) return

  //   setUploading(true)
  //   try {
  //     const url = await uploadToCloudinary(file)

  //     if (type === 'event') {
  //       setFormData(prev => ({ ...prev, image: url }))
  //       setImagePreview(url)
  //     }

  //     if (type === 'host') {
  //       setFormData(prev => ({
  //         ...prev,
  //         host: { ...prev.host, image: url },
  //       }))
  //     }

  //     if (type === 'speaker' && index !== undefined) {
  //       const updated = [...formData.speakers]
  //       updated[index].image = url

  //       setFormData(prev => ({
  //         ...prev,
  //         speakers: updated,
  //       }))
  //     }

  //     toast.success('Image uploaded!')
  //   } catch {
  //     toast.error('Upload failed')
  //   } finally {
  //     setUploading(false)
  //   }
  // }

  // // ================= FORM =================
  // const handleInputChange = (e: any) => {
  //   const { name, value } = e.target

  //   if (name === 'title') {
  //     setFormData(prev => ({
  //       ...prev,
  //       title: value,
  //       slug: slugify(value),
  //     }))
  //   } else if (name === 'capacity') {
  //     setFormData(prev => ({ ...prev, capacity: parseInt(value) || 0 }))
  //   } else {
  //     setFormData(prev => ({ ...prev, [name]: value }))
  //   }
  // }

  // const handleSubmit = async (e: any) => {
  //   e.preventDefault()

  //   if (!formData.title || !formData.description || !formData.location) {
  //     return toast.error('Fill all required fields')
  //   }

  //   if (new Date(formData.startDate) >= new Date(formData.endDate)) {
  //     return toast.error('Invalid date range')
  //   }

  //   try {
  //     const eventData = {
  //       ...formData,
  //       slug: formData.slug || slugify(formData.title),
  //       startDate: Timestamp.fromDate(new Date(formData.startDate)),
  //       endDate: Timestamp.fromDate(new Date(formData.endDate)),
  //       registeredCount:
  //         editingId
  //           ? events.find(e => e.id === editingId)?.registeredCount || 0
  //           : 0,
  //     }

  //     if (editingId) {
  //       await updateDoc(doc(db, 'events', editingId), {
  //         ...eventData,
  //         updatedAt: Timestamp.now(),
  //       })
  //       toast.success('Updated!')
  //     } else {
  //       await addDoc(collection(db, 'events'), {
  //         ...eventData,
  //         createdAt: Timestamp.now(),
  //         updatedAt: Timestamp.now(),
  //       })
  //       toast.success('Added!')
  //     }

  //     handleCancel()
  //     fetchEvents()
  //   } catch {
  //     toast.error('Save failed')
  //   }
  // }

  // const handleEdit = (event: Event) => {
  //   setFormData({
  //     ...event,
  //     startDate: new Date(event.startDate).toString(),
  //     endDate: new Date(event.endDate).toString(),
  //     host: event.host || { name: '', role: '', image: '' },
  //     speakers: event.speakers || [],
  //   } as any)

  //   setImagePreview(event.image)
  //   setEditingId(event.id)
  //   setShowForm(true)
  // }

  // const handleDelete = async (id: string) => { 
  //   if (!window.confirm('Are you sure?')) 
  //     return 
  //   try {
  //      await deleteDoc(doc(db, 'events', id)) 
  //      toast.success('Event deleted!')
  //       fetchEvents()
  //      }
  //   catch (error) {
  //     console.error('Error deleting event:', error) 
  //     toast.error('Failed to delete event') 
  //   }
  // }

  // const handleCancel = () => {
  //   setShowForm(false)
  //   setEditingId(null)
  //   setImagePreview(null)

  //   setFormData({
  //     title: '',
  //     slug: '',
  //     description: '',
  //     location: '',
  //     startDate: '',
  //     endDate: '',
  //     image: '',
  //     category: '',
  //     capacity: 0,
  //     host: { name: '', role: '', image: '' },
  //     speakers: [],
  //   })
  // }

  // // ================= SPEAKERS =================
  // const addSpeaker = () => {
  //   setFormData(prev => ({
  //     ...prev,
  //     speakers: [...prev.speakers, { name: '', role: '', image: '' }],
  //   }))
  // }

  // const updateSpeaker = (i: number, field: string, value: string) => {
  //   const updated = [...formData.speakers]
  //   updated[i][field] = value

  //   setFormData(prev => ({ ...prev, speakers: updated }))
  // }

  // const removeSpeaker = (i: number) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     speakers: prev.speakers.filter((_, index) => index !== i),
  //   }))
  // }


  //   // ✅ EXPORT CSV
  // const exportToCSV = () => {
  //   if (!registrations.length) return

  //   const headers = ['Name', 'Email', 'Phone', 'Department', 'Level']
  //   const rows = registrations.map(u => [
  //     u.name,
  //     u.email,
  //     u.phone,
  //     u.department,
  //     u.level
  //   ])

  //   const csv =
  //     [headers, ...rows]
  //       .map(row => row.join(','))
  //       .join('\n')

  //   const blob = new Blob([csv], { type: 'text/csv' })
  //   const url = URL.createObjectURL(blob)

  //   const a = document.createElement('a')
  //   a.href = url
  //   a.download = `${selectedEvent?.title}-registrations.csv`
  //   a.click()
  // }

  // // ✅ ATTENDANCE SHEET (PRINT)
  // const downloadAttendance = () => {
  //   const win = window.open('', '_blank')

  //   if (!win) return

  //   win.document.write(`
  //     <html>
  //       <head>
  //         <title>${selectedEvent?.title} Attendance</title>
  //       </head>
  //       <body>
  //         <h2>${selectedEvent?.title} Attendance Sheet</h2>
  //         <table border="1" cellpadding="10">
  //           <tr>
  //             <th>Name</th>
  //             <th>Email</th>
  //             <th>Phone</th>
  //             <th>Department</th>
  //             <th>Level</th>
  //             <th>Signature</th>
  //           </tr>
  //           ${registrations.map(u => `
  //             <tr>
  //               <td>${u.name}</td>
  //               <td>${u.email}</td>
  //               <td>${u.phone}</td>
  //               <td>${u.department}</td>
  //               <td>${u.level}</td>
  //               <td></td>
  //             </tr>
  //           `).join('')}
  //         </table>
  //       </body>
  //     </html>
  //   `)

  //   win.print()
  // }

  // if (loading) return <Loader className="animate-spin m-auto mt-10" />



    const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [registrations, setRegistrations] = useState<any[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<any[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
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
    host: { name: '', role: '', image: '' },
    speakers: [] as { name: string; role: string; image: string }[],
  })

  // ================= FETCH EVENTS =================
  const fetchEvents = async () => {
    setLoading(true)
    try {
      const eventsQuery = query(collection(db, 'events'), orderBy('startDate', 'asc'))
      const regQuery = query(collection(db, 'event_registrations'))

      const [eventSnap, regSnap] = await Promise.all([
        getDocs(eventsQuery),
        getDocs(regQuery),
      ])

      const eventsList: Event[] = eventSnap.docs.map((docSnap) => {
        const data = docSnap.data() as any
        return {
          id: docSnap.id,
          ...data,
          status: getEventStatus(data.startDate, data.endDate),
        }
      })

      // ✅ FIXED COUNT LOGIC
      const regMap: Record<string, number> = {}

      regSnap.docs.forEach((doc) => {
        const data = doc.data()
        const eventId = data.eventId

        if (!regMap[eventId]) regMap[eventId] = 0
        regMap[eventId]++
      })

      const finalEvents = eventsList.map((event) => ({
        ...event,
        registeredCount: regMap[event.id] || 0,
      }))

      setEvents(finalEvents)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  // ================= FETCH REGISTRATIONS =================
  const fetchRegistrations = async (eventId: string) => {
    setLoadingRegistrations(true)
    try {
      const q = query(
        collection(db, 'event_registrations'),
        where('eventId', '==', eventId)
      )

      const snap = await getDocs(q)
      const data = snap.docs.map((doc) => doc.data())

      setRegistrations(data)
      setFilteredRegistrations(data)
    } catch {
      toast.error('Failed to load registrations')
    } finally {
      setLoadingRegistrations(false)
    }
  }

  // ================= SEARCH =================
  useEffect(() => {
    if (!search) {
      setFilteredRegistrations(registrations)
    } else {
      const filtered = registrations.filter((u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.department?.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredRegistrations(filtered)
    }
  }, [search, registrations])

  // ================= IMAGE UPLOAD =================
  const handleImageUpload = async (
    file: File,
    type: 'event' | 'host' | 'speaker',
    index?: number
  ) => {
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)

      if (type === 'event') {
        setFormData((p) => ({ ...p, image: url }))
        setImagePreview(url)
      }

      if (type === 'host') {
        setFormData((p) => ({
          ...p,
          host: { ...p.host, image: url },
        }))
      }

      if (type === 'speaker' && index !== undefined) {
        const updated = [...formData.speakers]
        updated[index].image = url
        setFormData((p) => ({ ...p, speakers: updated }))
      }

      toast.success('Image uploaded!')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // ================= FORM =================
  const handleInputChange = (e: any) => {
    const { name, value } = e.target

    if (name === 'title') {
      setFormData((p) => ({
        ...p,
        title: value,
        slug: slugify(value),
      }))
    } else if (name === 'capacity') {
      setFormData((p) => ({ ...p, capacity: parseInt(value) || 0 }))
    } else {
      setFormData((p) => ({ ...p, [name]: value }))
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    try {
      const eventData = {
        ...formData,
        slug: formData.slug || slugify(formData.title),
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
      }

      if (editingId) {
        await updateDoc(doc(db, 'events', editingId), {
          ...eventData,
          updatedAt: Timestamp.now(),
        })
        toast.success('Updated!')
      } else {
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
        toast.success('Added!')
      }

      handleCancel()
      fetchEvents()
    } catch (err) {
      console.error(err)
      toast.error('Save failed')
    }
  }

  const handleEdit = (event: Event) => {
    setFormData({
      ...event,
      startDate: new Date(event.startDate).toString().slice(0, 16),
      endDate: new Date(event.endDate).toString().slice(0, 16),
      host: event.host || { name: '', role: '', image: '' },
      speakers: event.speakers || [],
    } as any)

    setImagePreview(event.image)
    setEditingId(event.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete event?')) return
    try {
      await deleteDoc(doc(db, 'events', id))
      toast.success('Deleted!')
      fetchEvents()
    } catch {
      toast.error('Delete failed')
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
      host: { name: '', role: '', image: '' },
      speakers: [],
    })
  }
    // ================= SPEAKERS =================
  const addSpeaker = () => {
    setFormData(prev => ({
      ...prev,
      speakers: [...prev.speakers, { name: '', role: '', image: '' }],
    }))
  }

  const updateSpeaker = (i: number, field: string, value: string) => {
    const updated = [...formData.speakers]
    updated[i][field] = value

    setFormData(prev => ({ ...prev, speakers: updated }))
  }

  const removeSpeaker = (i: number) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, index) => index !== i),
    }))
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


  // ================= UI =================
  if (loading) return <Loader className="animate-spin m-auto mt-10" />



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

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="card p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* BASIC INFO */}
            <div>
              <label className="block mb-2">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Slug</label>
              <input
                name="slug"
                value={formData.slug}
                className="input-field bg-muted"
                disabled
              />
            </div>

            <div>
              <label className="block mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                required
              />
            </div>

            {/* GRID */}
            <div className="grid md:grid-cols-2 gap-6">
              <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" className="input-field" />
              <input name="category" value={formData.category} onChange={handleInputChange} placeholder="Category" className="input-field" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} className="input-field" />
              <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} className="input-field" />
            </div>

            <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} className="input-field" />

            {/* ================= EVENT IMAGE ================= */}
            <div>
              <label className="block mb-2">Event Image</label>

              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} className="w-40 rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setFormData(prev => ({ ...prev, image: '' }))
                    }}
                    className="absolute top-2 right-2 bg-error text-white p-1 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
         

                 <label className="cursor-pointer flex flex-col items-center gap-2">
                     <Upload size={24} className="text-muted-foreground" />
                     <span className="text-sm text-muted-foreground">Click to upload image</span>
                     <input
                       type="file"
                       accept="image/*"
 onChange={(e) =>
                    handleImageUpload(e.target.files![0], 'event')
                  }                       disabled={uploading}
                       className="hidden"
                     />
                   </label>
              )}
            </div>

            {/* ================= HOST ================= */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Host</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <input
                  placeholder="Name"
                  value={formData.host.name}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      host: { ...prev.host, name: e.target.value },
                    }))
                  }
                  className="input-field"
                />

                <input
                  placeholder="Role"
                  value={formData.host.role}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      host: { ...prev.host, role: e.target.value },
                    }))
                  }
                  className="input-field"
                />

                <input
                  type="file"
                  onChange={(e) =>
                    handleImageUpload(e.target.files![0], 'host')
                  }
                  className="input-field"
                />
              </div>

              {formData.host.image && (
                <img
                  src={formData.host.image}
                  className="w-20 h-20 rounded-full mt-3 object-cover"
                />
              )}
            </div>

            {/* ================= SPEAKERS ================= */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Speakers</h3>

              <div className="space-y-4">
                {formData.speakers.map((speaker, index) => (
                  <div
                    key={index}
                    className="grid md:grid-cols-4 gap-3 items-center border p-3 rounded-lg"
                  >
                    <input
                      placeholder="Name"
                      value={speaker.name}
                      onChange={(e) =>
                        updateSpeaker(index, 'name', e.target.value)
                      }
                      className="input-field"
                    />

                    <input
                      placeholder="Role"
                      value={speaker.role}
                      onChange={(e) =>
                        updateSpeaker(index, 'role', e.target.value)
                      }
                      className="input-field"
                    />

                    <input
                      type="file"
                      onChange={(e) =>
                        handleImageUpload(e.target.files![0], 'speaker', index)
                      }
                      className="input-field"
                    />

                    <button
                      type="button"
                      onClick={() => removeSpeaker(index)}
                      className="bg-error text-white px-3 py-2 rounded"
                    >
                      Remove
                    </button>

                    {speaker.image && (
                      <img
                        src={speaker.image}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addSpeaker}
                className="mt-3 px-4 py-2 border rounded-lg hover:bg-muted"
              >
                + Add Speaker
              </button>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 pt-4">
              <button className="btn-primary flex-1">
                {editingId ? 'Update' : 'Add'} Event
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Location</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Registered</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {events.map(event => (
                <tr key={event.id} className="border-t">
                  <td className="px-6 py-4">{event.title}</td>
                  <td className="px-6 py-4">{formatDate(event.startDate)}</td>
                  <td className="px-6 py-4">{event.location}</td>

                  <td className="px-6 py-4">
                    <span className="badge">
                      {event.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {event.registeredCount || 0}
                  </td>

                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedEvent(event)
                        fetchRegistrations(event.id)
                      }}
                    >
                      View
                    </button>

                    <button onClick={() => handleEdit(event)}>
                      <Edit size={16} />
                    </button>

                    <button onClick={() => handleDelete(event.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* ================= MODAL ================= */}
    {selectedEvent && (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
        <div className="bg-white w-full max-w-4xl p-6 rounded">

          <div className="flex justify-between mb-4">
            <h3>{selectedEvent.title}</h3>
            <button onClick={() => setSelectedEvent(null)}>✕</button>
          </div>

          <input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field mb-4"
          />

          <div className="flex gap-2 mb-4">
            <button onClick={exportToCSV}>Export CSV</button>
            <button onClick={downloadAttendance}>Attendance</button>
          </div>

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
                    <td>
                      <Link to={`mailto:${u.email}`} className="text-blue-600 hover:underline">
                      {u.email}
                      </Link>
                      </td>
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