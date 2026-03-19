import { useEffect, useState } from 'react'
import { collection, query, getDocs, orderBy, updateDoc, increment, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Book } from '@/types'
import toast from 'react-hot-toast'
import { Loader, Download, BookOpen } from 'lucide-react'

export default function Books() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksQuery = query(
          collection(db, 'books'),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(booksQuery)
        setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)))
      } catch (error) {
        console.error('Error fetching books:', error)
        toast.error('Failed to load books')
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  const handleDownload = async (book: Book) => {
    try {
      // Increment download count
      await updateDoc(doc(db, 'books', book.id), {
        downloadCount: increment(1),
      })

      // Open file in new tab
      window.open(book.fileUrl, '_blank')
      toast.success('Download started!')

      // Update local state
      setBooks(books.map(b => 
        b.id === book.id 
          ? { ...b, downloadCount: b.downloadCount + 1 }
          : b
      ))
    } catch (error) {
      console.error('Error downloading:', error)
      toast.error('Failed to start download')
    }
  }

  const categories = Array.from(new Set(books.map(b => b.category)))
  const filteredBooks = selectedCategory
    ? books.filter(b => b.category === selectedCategory)
    : books

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <BookOpen size={40} />
            Books & Resources
          </h1>
          <p className="text-lg text-white/90">Access our collection of learning materials and resources</p>
        </div>
      </div>

      {/* Content */}
      <section className="container-custom py-12 md:py-16">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-foreground mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                All ({books.length})
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {category} ({books.filter(b => b.category === category).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredBooks.map(book => (
            <div key={book.id} className="card overflow-hidden hover:shadow-lg transition-all flex flex-col">
              {book.image && (
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-56 object-cover"
                />
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{book.description}</p>
                  {book.category && (
                    <p className="badge text-xs mb-3">{book.category}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Download size={16} />
                    <span>{book.downloadCount} downloads</span>
                  </div>
                  <button
                    onClick={() => handleDownload(book)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">No books in this category.</p>
          </div>
        )}
      </section>

      {/* Upload CTA for logged-in users */}
      <section className="container-custom mb-12">
        <div className="bg-muted/50 rounded-lg p-8 md:p-12 text-center border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">Have Resources to Share?</h2>
          <p className="text-muted-foreground mb-4">Contact the admin team to contribute to our resource library</p>
          <a
            href="mailto:admin@department.edu"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
          >
            Submit Resource
          </a>
        </div>
      </section>
    </div>
  )
}
