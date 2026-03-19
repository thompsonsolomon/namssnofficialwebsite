# Department Website

A full-stack department website built with Vite + React, Firebase, and Cloudinary. Features a responsive design with admin dashboard for managing staff, events, announcements, books, and home page cards.

## Features

### Public Pages
- **Home**: Banner image, editable card section, staff profile showcase
- **About**: Department history, mission, detailed staff bios with filtering
- **Blog**: Post feed with search and filtering, detail pages with nested comments
- **Events**: Event categorization (past/present/future), event detail pages with registration form
- **Announcements**: List view with pin-to-top functionality
- **Books**: Card grid of resources with download links

### Admin Dashboard
- **Staff Management**: Add, edit, delete, and reorder staff members
- **Event Management**: Create and manage events with registration tracking
- **Announcement Management**: Post announcements with pin, expiration, and image support
- **Books Management**: Upload and manage learning resources
- **Card Management**: Edit home page card content
- **Image Uploads**: Cloudinary integration for all image uploads

### Authentication
- Email/password authentication with Firebase
- Admin role-based access control
- User registration and login

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with CSS variables for theming
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Image Upload**: Cloudinary
- **UI Components**: Custom components with Lucide icons
- **Notifications**: React Hot Toast

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd department-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database and Authentication (Email/Password)
   - Copy your credentials

4. **Setup Cloudinary**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Create an account and get your cloud name
   - Create an unsigned upload preset

5. **Create environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Firebase and Cloudinary credentials:
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
   ```

6. **Setup Firebase Collections**
   Create the following collections in Firestore:
   - `users` - User data
   - `staff` - Staff members
   - `blog_posts` - Blog posts
   - `blog_comments` - Blog comments
   - `events` - Events
   - `event_registrations` - Event registrations
   - `announcements` - Announcements
   - `books` - Books and resources
   - `editableCards` - Home page cards

7. **Run the development server**
   ```bash
   npm run dev
   ```

## Database Schema

### Collections

#### users
```typescript
{
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: Timestamp
}
```

#### staff
```typescript
{
  name: string
  role: 'advisor' | 'president' | 'deputy' | 'secretary' | 'treasurer' | 'member'
  bio: string
  email: string
  phone: string
  image: string (Cloudinary URL)
  order: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### blog_posts
```typescript
{
  title: string
  slug: string
  content: string
  excerpt: string
  author: string
  image: string (Cloudinary URL)
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt: Timestamp
}
```

#### blog_comments
```typescript
{
  postId: string
  author: string
  content: string
  parentId?: string (for nested replies)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### events
```typescript
{
  title: string
  slug: string
  description: string
  location: string
  startDate: Timestamp
  endDate: Timestamp
  image: string (Cloudinary URL)
  category: string
  capacity?: number
  registeredCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### event_registrations
```typescript
{
  eventId: string
  name: string
  email: string
  phone: string
  department: string
  level: string
  createdAt: Timestamp
}
```

#### announcements
```typescript
{
  title: string
  content: string
  image?: string (Cloudinary URL)
  isPinned: boolean
  expiresAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### books
```typescript
{
  title: string
  author: string
  description: string
  image: string (Cloudinary URL)
  fileUrl: string (Cloudinary URL)
  category: string
  downloadCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### editableCards
```typescript
{
  title: string
  description: string
  image?: string (Cloudinary URL)
  order: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Customization

### Color Variables
Edit `src/index.css` to customize colors:
```css
:root {
  --color-primary: #0066cc;
  --color-secondary: #6366f1;
  --color-accent: #f59e0b;
  /* ... more colors */
}
```

### Tailwind Configuration
Modify `tailwind.config.js` to extend theme settings.

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   └── admin/
│       ├── AdminStaff.tsx
│       ├── AdminEvents.tsx
│       ├── AdminAnnouncements.tsx
│       ├── AdminBooks.tsx
│       └── AdminCards.tsx
├── config/
│   ├── firebase.ts
│   └── cloudinary.ts
├── context/
│   └── AuthContext.tsx
├── pages/
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Blog.tsx
│   ├── BlogDetail.tsx
│   ├── Events.tsx
│   ├── EventDetail.tsx
│   ├── Announcements.tsx
│   ├── Books.tsx
│   ├── Admin.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── types/
│   └── index.ts
├── utils/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

## Deployment

### Deploy to Vercel
```bash
vercel
```

### Deploy to other platforms
The project can be deployed to any static hosting platform (Netlify, GitHub Pages, etc.) after running `npm run build`.

## Admin Login

To access the admin dashboard:
1. Create an account at `/register`
2. Set the user's role to 'admin' in Firebase
3. Login at `/login`
4. Access admin dashboard at `/admin`

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please create an issue in the repository.
