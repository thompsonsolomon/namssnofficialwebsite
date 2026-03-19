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
import { Book } from '@/types'
import toast from 'react-hot-toast'
import { Edit, Trash2, Plus, Loader, Upload, X } from 'lucide-react'

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    image: '',
    fileUrl: '',
    category: '',
  })

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const booksQuery = query(collection(db, 'books'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(booksQuery)
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)))
    } catch (error) {
      console.error('Error fetching books:', error)
      toast.error('Failed to load books')
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileUrl = await uploadToCloudinary(file)
      setFormData(prev => ({ ...prev, fileUrl }))
      toast.success('File uploaded!')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.author.trim() || !formData.fileUrl.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        image: formData.image,
        fileUrl: formData.fileUrl,
        category: formData.category,
        downloadCount: editingId ? books.find(b => b.id === editingId)?.downloadCount || 0 : 0,
      }

      if (editingId) {
        await updateDoc(doc(db, 'books', editingId), {
          ...bookData,
          updatedAt: Timestamp.now(),
        })
        toast.success('Book updated!')
      } else {
        await addDoc(collection(db, 'books'), {
          ...bookData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
        toast.success('Book added!')
      }

      setFormData({
        title: '',
        author: '',
        description: '',
        image: '',
        fileUrl: '',
        category: '',
      })
      setImagePreview(null)
      setEditingId(null)
      setShowForm(false)
      fetchBooks()
    } catch (error) {
      console.error('Error saving book:', error)
      toast.error('Failed to save book')
    }
  }

  const handleEdit = (book: Book) => {
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      image: book.image,
      fileUrl: book.fileUrl,
      category: book.category,
    })
    setImagePreview(book.image)
    setEditingId(book.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return

    try {
      await deleteDoc(doc(db, 'books', id))
      toast.success('Book deleted!')
      fetchBooks()
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error('Failed to delete book')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setImagePreview(null)
    setFormData({
      title: '',
      author: '',
      description: '',
      image: '',
      fileUrl: '',
      category: '',
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
        <h2 className="text-2xl font-bold text-foreground">Books & Resources</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={18} />
            Add Book
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Book Title"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Author *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Author Name"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Book description..."
                rows={4}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Textbook, Reference, Tutorial"
                className="input-field"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cover Image</label>
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
                    <span className="text-sm text-muted-foreground">Click to upload cover image</span>
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

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                PDF/Document File *
              </label>
              <div className="border border-dashed border-border rounded-lg p-6 text-center">
                {formData.fileUrl ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">File uploaded ✓</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, fileUrl: '' }))}
                      className="p-1 text-error hover:bg-error/10 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={24} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload PDF/document</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
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
                {editingId ? 'Update' : 'Add'} Book
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

      {/* Books List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => (
          <div key={book.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
            {book.image && (
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-foreground mb-1 line-clamp-2">{book.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{book.description}</p>
              {book.category && (
                <p className="badge text-xs mb-3">{book.category}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(book)}
                  className="flex-1 p-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
                >
                  <Edit size={14} className="mx-auto" />
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="flex-1 p-2 rounded-lg border border-error text-error hover:bg-error/10 transition-colors text-sm font-medium"
                >
                  <Trash2 size={14} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12 card p-8">
          <p className="text-muted-foreground">No books yet. Add one to get started!</p>
        </div>
      )}
    </div>
  )
}
