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
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { uploadToCloudinary } from '@/config/cloudinary'
import { Announcement } from '@/types'
import { getRelativeTime } from '@/utils'
import toast from 'react-hot-toast'
import { Edit, Trash2, Plus, Loader, Upload, X, Pin } from 'lucide-react'

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    isPinned: false,
    expiresAt: '',
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('isPinned', 'desc'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(announcementsQuery)
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)))
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const announcementData = {
        title: formData.title,
        content: formData.content,
        image: formData.image,
        isPinned: formData.isPinned,
        expiresAt: formData.expiresAt ? Timestamp.fromDate(new Date(formData.expiresAt)) : null,
      }

      if (editingId) {
        await updateDoc(doc(db, 'announcements', editingId), {
          ...announcementData,
          updatedAt: Timestamp.now(),
        })
        toast.success('Announcement updated!')
      } else {
        await addDoc(collection(db, 'announcements'), {
          ...announcementData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
        toast.success('Announcement added!')
      }

      setFormData({
        title: '',
        content: '',
        image: '',
        isPinned: false,
        expiresAt: '',
      })
      setImagePreview(null)
      setEditingId(null)
      setShowForm(false)
      fetchAnnouncements()
    } catch (error) {
      console.error('Error saving announcement:', error)
      toast.error('Failed to save announcement')
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      image: announcement.image || '',
      isPinned: announcement.isPinned,
      expiresAt: announcement.expiresAt 
        ? (announcement.expiresAt instanceof Timestamp 
          ? announcement.expiresAt.toDate().toISOString() 
          : new Date(announcement.expiresAt).toISOString())
        : '',
    })
    setImagePreview(announcement.image || null)
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      await updateDoc(doc(db, 'announcements', id), {
        isPinned: !isPinned,
      })
      toast.success(isPinned ? 'Announcement unpinned!' : 'Announcement pinned!')
      fetchAnnouncements()
    } catch (error) {
      console.error('Error pinning announcement:', error)
      toast.error('Failed to update announcement')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return

    try {
      await deleteDoc(doc(db, 'announcements', id))
      toast.success('Announcement deleted!')
      fetchAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Failed to delete announcement')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setImagePreview(null)
    setFormData({
      title: '',
      content: '',
      image: '',
      isPinned: false,
      expiresAt: '',
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
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Announcement Management</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={18} />
            Add Announcement
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
                placeholder="Announcement Title"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Announcement content..."
                rows={6}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Expires At</label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPinned"
                    checked={formData.isPinned}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-foreground">Pin to top</span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Featured Image</label>
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
                {editingId ? 'Update' : 'Add'} Announcement
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

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(announcement => (
          <div key={announcement.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-foreground">{announcement.title}</h3>
                  {announcement.isPinned && (
                    <Pin size={16} className="text-accent" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{getRelativeTime(announcement.createdAt)}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handlePin(announcement.id, announcement.isPinned)}
                  className={`p-2 rounded-lg border transition-colors ${
                    announcement.isPinned
                      ? 'border-accent text-accent hover:bg-accent/10'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  <Pin size={16} />
                </button>
                <button
                  onClick={() => handleEdit(announcement)}
                  className="p-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 rounded-lg border border-error text-error hover:bg-error/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {announcement.image && (
              <img
                src={announcement.image}
                alt={announcement.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}

            <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{announcement.content}</p>

            {announcement.expiresAt && (
              <p className="text-xs text-warning">
                Expires: {new Date(announcement.expiresAt instanceof Timestamp ? announcement.expiresAt.toDate() : announcement.expiresAt).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="text-center py-12 card p-8">
          <p className="text-muted-foreground">No announcements yet. Add one to get started!</p>
        </div>
      )}
    </div>
  )
}
