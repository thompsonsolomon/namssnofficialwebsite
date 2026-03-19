import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { BlogPost, BlogComment } from '@/types'
import { formatDateTime, getRelativeTime } from '@/utils'
import toast from 'react-hot-toast'
import { Loader, ArrowLeft, Send } from 'lucide-react'

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch post
        const postsQuery = query(
          collection(db, 'blog_posts'),
          where('slug', '==', slug)
        )
        const postsSnapshot = await getDocs(postsQuery)
        if (postsSnapshot.empty) {
          toast.error('Post not found')
          navigate('/blog')
          return
        }
        const postData = postsSnapshot.docs[0].data() as BlogPost
        postData.id = postsSnapshot.docs[0].id
        setPost(postData)

        // Fetch comments
        const commentsQuery = query(
          collection(db, 'blog_comments'),
          where('postId', '==', postsSnapshot.docs[0].id),
          orderBy('createdAt', 'asc')
        )
        const commentsSnapshot = await getDocs(commentsQuery)
        setComments(commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogComment)))
      } catch (error) {
        console.error('Error fetching post:', error)
        toast.error('Failed to load post')
        navigate('/blog')
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchData()
  }, [slug, navigate])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post || !newComment.trim() || !authorName.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'blog_comments'), {
        postId: post.id,
        author: authorName,
        content: newComment,
        parentId: replyingTo || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      setNewComment('')
      setReplyingTo(null)

      // Refresh comments
      const commentsQuery = query(
        collection(db, 'blog_comments'),
        where('postId', '==', post.id),
        orderBy('createdAt', 'asc')
      )
      const commentsSnapshot = await getDocs(commentsQuery)
      setComments(commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogComment)))

      toast.success('Comment added successfully!')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  // Build comment tree
  const buildCommentTree = () => {
    const commentMap = new Map<string, BlogComment & { replies: any[] }>()
    const topLevelComments: (BlogComment & { replies: any[] })[] = []

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    comments.forEach(comment => {
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(commentMap.get(comment.id)!)
      } else if (!comment.parentId) {
        topLevelComments.push(commentMap.get(comment.id)!)
      }
    })

    return topLevelComments
  }

  const CommentThread = ({ comment, depth = 0 }: { comment: any; depth?: number }) => (
    <div className={`mb-4 ${depth > 0 ? 'ml-6 border-l-2 border-border pl-4' : ''}`}>
      <div className="card p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold text-foreground">{comment.author}</p>
            <p className="text-xs text-muted-foreground">{getRelativeTime(comment.createdAt)}</p>
          </div>
        </div>
        <p className="text-foreground mb-3">{comment.content}</p>
        <button
          onClick={() => setReplyingTo(comment.id)}
          className="text-sm text-primary hover:underline"
        >
          Reply
        </button>
      </div>
      {comment.replies && comment.replies.map((reply: any) => (
        <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  if (!post) {
    return null
  }

  const commentTree = buildCommentTree()

  return (
    <div className="bg-background">
      {/* Back Button */}
      <div className="container-custom py-6">
        <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft size={20} />
          Back to Blog
        </Link>
      </div>

      {/* Article Content */}
      <article className="container-custom max-w-3xl mb-12">
        <img
          src={post.image || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop'}
          alt={post.title}
          className="w-full h-96 object-cover rounded-lg mb-8"
        />

        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{post.title}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
            <span>By {post.author}</span>
            <span>{formatDateTime(post.publishedAt)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="badge text-xs">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="prose prose-invert max-w-none mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      </article>

      {/* Comments Section */}
      <section className="container-custom max-w-3xl mb-12 bg-muted/50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-foreground mb-8">Comments ({commentTree.length})</h2>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="card p-6 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="Enter your name"
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {replyingTo ? 'Reply to comment' : 'Add a comment'}
            </label>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="input-field"
              required
            />
          </div>
          <div className="flex justify-between items-center">
            {replyingTo && (
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null)
                  setNewComment('')
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel reply
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Comments Thread */}
        <div>
          {commentTree.length > 0 ? (
            commentTree.map(comment => (
              <CommentThread key={comment.id} comment={comment} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No comments yet. Be the first!</p>
          )}
        </div>
      </section>
    </div>
  )
}
