# Fitness Tracker App

A full-stack web application for tracking workouts and weight progress with user authentication and data persistence.

## Features

### 🏋️ Workout Tracking
- Log workouts with multiple exercises
- Track sets, reps, and weight for each exercise
- View detailed workout history
- Calculate total volume per workout
- Delete and edit workouts

### ⚖️ Weight Tracking
- Record body weight with dates and notes
- View weight progress over time
- Track weight change statistics (highest, lowest, total change)
- Visual progress indicators

### 👤 User Management
- User registration and login
- JWT-based authentication
- Secure password handling with bcrypt
- User profile management

### 📊 Dashboard
- Overview of fitness progress
- Recent workout and weight entry summaries
- Quick action buttons
- Statistics and insights

## Tech Stack

### Frontend
- **React 19** - UI library
- **Axios** - HTTP client
- **Context API** - State management
- **CSS3** - Styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Express Rate Limit** - Rate limiting

## Prerequisites

Before running the application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Workout-Set-and-Weight-Tracker
```

### 2. Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env .env.local

# Edit .env.local with your configuration:
# - Set your MongoDB connection string
# - Change JWT_SECRET to a secure random string
# - Adjust PORT if needed
```

**Backend Environment Variables (.env.local):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitness-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 3. Set Up Frontend

```bash
# Navigate back to root directory
cd ..

# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local if needed (default API URL should work for local development)
```

**Frontend Environment Variables (.env.local):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

**Local MongoDB:**
```bash
# Start MongoDB service (varies by OS)
# Windows: mongod
# macOS: brew services start mongodb/brew/mongodb-community
# Linux: sudo systemctl start mongod
```

**Or use MongoDB Atlas:**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Replace the `MONGODB_URI` in your backend `.env.local` file

### 5. Run the Application

**Start Backend Server:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Start Frontend Development Server:**
```bash
# In a new terminal, from the root directory
npm start
```
Frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Workouts
- `POST /api/workouts` - Create workout
- `GET /api/workouts` - Get user's workouts (with pagination)
- `GET /api/workouts/stats` - Get workout statistics
- `GET /api/workouts/:id` - Get specific workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Weight Entries
- `POST /api/weight` - Create weight entry
- `GET /api/weight` - Get user's weight entries (with pagination)
- `GET /api/weight/stats` - Get weight statistics
- `GET /api/weight/:id` - Get specific weight entry
- `PUT /api/weight/:id` - Update weight entry
- `DELETE /api/weight/:id` - Delete weight entry

## Database Schema

### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Workout
```javascript
{
  user: ObjectId (ref: User),
  date: Date,
  exercises: [{
    name: String,
    sets: [{
      reps: Number,
      weight: Number
    }]
  }],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Weight Entry
```javascript
{
  user: ObjectId (ref: User),
  weight: Number,
  date: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Update CORS origin to your frontend domain
3. Use a strong, unique JWT_SECRET
4. Use MongoDB Atlas or a managed MongoDB service
5. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Update `REACT_APP_API_URL` to your backend URL
2. Build the production version: `npm run build`
3. Deploy to platforms like Netlify, Vercel, or AWS S3

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Request Rate Limiting**: Prevents abuse
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Controlled cross-origin access
- **Security Headers**: Helmet.js for security headers

## Development

### Project Structure
```
Workout-Set-and-Weight-Tracker/
├── backend/                 # Backend API
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── server.js           # Express server
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   └── utils/              # Utility functions
└── public/                 # Static files
```

### Available Scripts

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

**Backend:**
- `npm run dev` - Start with nodemon (development)
- `npm start` - Start production server

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the ISC License.