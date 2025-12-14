# Lab Inventory Management - Backend

Complete backend API for the Lab Inventory Management System with AI integration.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. **Install dependencies:**
```bash
cd Backend
npm install
```

2. **Configure environment variables:**
Edit `.env` file with your settings:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lab-inventory
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
GEMINI_API_KEY=your_google_gemini_api_key_here
```

3. **Start MongoDB** (if using local):
```bash
mongod
```

4. **Seed the database** (creates test data):
```bash
npm run seed
```

5. **Start the server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 🔑 Test Credentials

After running `npm run seed`, use these credentials:

| Role | Username | Password |
|------|----------|----------|
| Student | student1 | 123456 |
| Professor | professor1 | 123456 |
| Lab Assistant | assistant1 | 123456 |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Labs
- `GET /api/labs` - Get all labs (Protected)
- `GET /api/labs/:id` - Get lab by ID (Protected)
- `GET /api/labs/:id/materials` - Get lab materials (Protected)
- `POST /api/labs` - Create lab (Lab Assistant only)

### Materials
- `GET /api/materials` - Get all materials (Protected)
- `GET /api/materials/:id` - Get material by ID (Protected)
- `POST /api/materials` - Add material with AI categorization (Lab Assistant only)
- `PUT /api/materials/:id` - Update material (Lab Assistant only)
- `DELETE /api/materials/:id` - Delete material (Lab Assistant only)

### Requests (Student Material Requests)
- `POST /api/requests` - Create request (Student only)
- `GET /api/requests/my-requests` - Get student's requests (Student only)
- `GET /api/requests/pending` - Get pending requests (Lab Assistant only)
- `PUT /api/requests/:id/approve` - Approve request (Lab Assistant only)
- `PUT /api/requests/:id/reject` - Reject request (Lab Assistant only)

### Schedules (Lab Scheduling)
- `POST /api/schedules` - Create schedule (Professor only)
- `GET /api/schedules` - Get all schedules (Professor/Lab Assistant)
- `GET /api/schedules/my-schedules` - Get professor's schedules (Professor only)
- `PUT /api/schedules/:id` - Update schedule (Professor only - own schedules)
- `DELETE /api/schedules/:id` - Cancel schedule (Professor only - own schedules)
- `GET /api/schedules/check-availability` - Check time slot availability (Protected)

## 🤖 AI Features

### Smart Item Categorization
When adding materials via `POST /api/materials`, the system:
1. Sends item name and description to Google Gemini API
2. Automatically categorizes into: Equipment, Consumable, Chemical, Tool, or Electronic Component
3. Generates relevant tags (e.g., "networking", "measurement", "resistor")
4. Falls back to default categorization if API is unavailable

### Usage Tracking
The system logs all material usage for future demand forecasting:
- Tracks additions, removals, and request fulfillments
- Can be used to generate restock justifications with AI

## 📦 Database Models

### User
- username, email, password (hashed)
- role: student | professor | lab_assistant

### Lab
- name, description, location, capacity
- Contains multiple materials

### Material
- name, description, category, tags
- quantity, minThreshold
- AI-generated metadata
- Usage statistics

### Request
- Student material request
- Status: pending | approved | rejected | fulfilled
- Tracks approval/rejection with reasons

### Schedule
- Lab booking by professors
- Conflict detection
- Status: scheduled | completed | cancelled

## 🔒 Security Features

- JWT authentication with 7-day expiry
- Password hashing with bcrypt
- Role-based authorization middleware
- Token verification on all protected routes

## 🛠️ Tech Stack

- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Axios** - AI API integration
- **CORS** - Cross-origin support

## 📝 Notes

- The seed script creates 3 labs (Computer, Physics, Electronics) with sample materials
- AI categorization requires a valid Gemini API key (works without it using fallback)
- All timestamps are in UTC
- Material quantities are automatically updated when requests are approved

## 🐛 Troubleshooting

**MongoDB connection failed:**
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in `.env`

**Port already in use:**
- Change PORT in `.env` to another port (e.g., 5001)
- Or kill the process using port 5000

**JWT errors:**
- Clear frontend localStorage and login again
- Check JWT_SECRET is set in `.env`

## 📄 License

ISC
