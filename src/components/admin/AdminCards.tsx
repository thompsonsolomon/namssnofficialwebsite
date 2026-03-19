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
import { EditableCard } from '@/types'
import toast from 'react-hot-toast'
import { Edit, Trash2, Plus, Loader, Upload, X } from 'lucide-react'

export default function AdminCards() {
  const [cards, setCards] = useState<EditableCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    order: 0,
  })

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const cardsQuery = query(collection(db, 'editableCards'), orderBy('order', 'asc'))
      const snapshot = await getDocs(cardsQuery)
      setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EditableCard)))
    } catch (error) {
      console.error('Error fetching cards:', error)
      toast.error('Failed to load cards')
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
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const cardData = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        order: formData.order,
      }

      if (editingId) {
        await updateDoc(doc(db, 'editableCards', editingId), {
          ...cardData,
          updatedAt: Timestamp.now(),
        })
        toast.success('Card updated!')
      } else {
        await addDoc(collection(db, 'editableCards'), {
          ...cardData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
        toast.success('Card added!')
      }

      setFormData({
        title: '',
        description: '',
        image: '',
        order: cards.length,
      })
      setImagePreview(null)
      setEditingId(null)
      setShowForm(false)
      fetchCards()
    } catch (error) {
      console.error('Error saving card:', error)
      toast.error('Failed to save card')
    }
  }

  const handleEdit = (card: EditableCard) => {
    setFormData({
      title: card.title,
      description: card.description,
      image: card.image || '',
      order: card.order,
    })
    setImagePreview(card.image || null)
    setEditingId(card.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return

    try {
      await deleteDoc(doc(db, 'editableCards', id))
      toast.success('Card deleted!')
      fetchCards()
    } catch (error) {
      console.error('Error deleting card:', error)
      toast.error('Failed to delete card')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setImagePreview(null)
    setFormData({
      title: '',
      description: '',
      image: '',
      order: cards.length,
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
        <h2 className="text-2xl font-bold text-foreground">Home Page Cards</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={18} />
            Add Card
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
                placeholder="Card Title"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Card description..."
                rows={4}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="0"
                className="input-field"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Card Image</label>
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
                {editingId ? 'Update' : 'Add'} Card
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
          <div key={card.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
            {card.image && (
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{card.description}</p>
              <p className="text-xs text-muted-foreground mb-3">Order: {card.order}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(card)}
                  className="flex-1 p-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
                >
                  <Edit size={14} className="mx-auto" />
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="flex-1 p-2 rounded-lg border border-error text-error hover:bg-error/10 transition-colors text-sm font-medium"
                >
                  <Trash2 size={14} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-12 card p-8">
          <p className="text-muted-foreground">No cards yet. Add one to get started!</p>
        </div>
      )}
    </div>
  )
}
