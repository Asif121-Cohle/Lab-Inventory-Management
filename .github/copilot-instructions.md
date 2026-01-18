# Lab Inventory Management System - AI Coding Instructions

## Project Architecture

**Stack**: MongoDB + Express + React + Node.js (MERN) with Vite, featuring Google Gemini AI integration

**Structure**:
- `Backend/` - Express API server with Mongoose ODM (port 5000)
- `Frontend/` - React SPA with Vite dev server (port 5173)
- `Note/` - Implementation docs and feature guides (AI_CATEGORIZATION_FEATURE.md, QUICK_START.md, etc.)

## Role-Based Access Control (RBAC)

Three user roles with distinct permissions and workflows:

1. **`student`** - Can request materials, view request status
2. **`professor`** - Can schedule lab sessions, manage own schedules, view all schedules
3. **`lab_assistant`** - Can approve/reject requests, add/edit/delete materials, access all schedules

**Auth Implementation**:
- JWT tokens stored in localStorage (managed by AuthContext)
- Middleware: `auth.js` provides `auth` (verifies token) and `authorize(...roles)` (checks roles)
- Route protection: Backend uses `authorize('role1', 'role2')`, Frontend uses `<ProtectedRoute allowedRoles={['role1']}>`

## Critical Workflows

### Development Setup
```bash
# Backend (Terminal 1)
cd Backend
npm install
# Copy .env.example to .env and configure MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm run seed  # Creates test users and 3 labs with sample materials
npm run dev   # Runs with nodemon

# Frontend (Terminal 2)
cd Frontend
npm install
# Create .env with: VITE_API_URL=http://localhost:5000/api
npm run dev
```

**Test Credentials** (after seeding):
- Student: `student1@example.com / 123456`
- Professor: `professor1@example.com / 123456`
- Lab Assistant: `assistant1@example.com / 123456`

### MongoDB Setup
- Local: Run `mongod` before starting backend
- Connection string in `Backend/.env` as `MONGODB_URI`
- Models use Mongoose schemas with validation and pre-save hooks (e.g., password hashing in User model)

## AI Categorization Feature

**Google Gemini Integration** (`Backend/controllers/materialController.js`):
- Endpoint: `POST /api/materials/categorize` (lab_assistant only)
- Function: `categorizeMaterial(name, description)` 
- Returns: `{category: "Equipment|Consumable|Chemical|Tool|Electronic Component", tags: ["tag1", "tag2"]}`
- Graceful fallback: Returns default values if `GEMINI_API_KEY` not configured
- Used in: `addItemModal.jsx` - "AI Smart Categorization" button calls this before submission

**Setup**: Add `GEMINI_API_KEY` to `Backend/.env` (get from https://aistudio.google.com/app/apikey)

## Data Models & Relationships

**Key Models** (`Backend/models/`):
- `User`: username, email, password (bcrypt hashed), role (enum)
- `Lab`: id (string, e.g., "computer-lab"), name, location, capacity
- `Material`: name, category, tags[], quantity, minThreshold, lab (ref), aiGenerated flag
- `Request`: student (ref), material (ref), lab (ref), quantity, status ("pending"|"approved"|"rejected")
- `Schedule`: professor (ref), lab (ref), date, startTime, endTime

**Lab IDs**: Use string IDs like "computer-lab", "physics-lab", "electronics-lab" (NOT ObjectIds) when querying labs

## Frontend Patterns

**State Management**:
- `AuthContext` - Global user/role/token state, persists to localStorage, handles auto-logout on 401
- `LabContext` - Caches lab data, provides `refreshLabs()` after mutations
- API calls: Centralized in `services/api.js` with axios interceptors for auth headers

**Routing** (`App.jsx`):
- Public: `/`, `/login`, `/signupForm`
- Protected (all roles): `/dashboard`, `/lab/:labId`, `/material/:materialId`
- Role-specific: `/request-material` (student), `/schedule-lab` (professor), `/approve-request` (lab_assistant)

**Navigation Flow**:
1. Dashboard → Lab cards (click) → `/lab/:labId` (shows materials)
2. Lab Detail → Material cards (click) → `/material/:materialId` (shows details)
3. Material Detail → Role-based action buttons (Request/Reserve)

**Styling Convention**:
- Page styles in `Frontend/src/pages/CSS/` (e.g., `labDetail.css`)
- Component styles in `Frontend/src/components/CSS/` (e.g., `materialsSearch.css`)
- Global styles: `App.css`, `index.css`, `styling.css` (shared utilities)

## Common Patterns

**Adding New Protected Route**:
1. Backend: Create route in `routes/`, add auth middleware, use `authorize('role')` for role restriction
2. Frontend: Add route to `App.jsx` wrapped in `<ProtectedRoute allowedRoles={['role']}>`
3. Update `services/api.js` with API method grouped by domain (authAPI, labAPI, etc.)

**API Error Handling**:
- Backend: Use try-catch in controllers, return `res.status(4xx/5xx).json({ message: '...' })`
- Frontend: axios interceptor auto-redirects on 401, components handle errors in catch blocks with state updates

**Material Card Status Logic**:
- In Stock: `quantity > minThreshold` (green badge)
- Low Stock: `quantity <= minThreshold && quantity > 0` (yellow badge)
- Out of Stock: `quantity === 0` (red badge)

## Testing & Debugging

**Backend Health Check**: `GET http://localhost:5000/api/health` - Returns API status and endpoints
**Seed Database**: `npm run seed` in Backend - Recreates fresh test data (deletes existing)
**Check Auth**: Look for JWT token in browser localStorage, verify role matches expected value
**AI Debugging**: Check console logs in `materialController.js` for "🤖 AI Categorization request" messages

## Integration Points

**Frontend → Backend**: All API calls through `api.js` with `import.meta.env.VITE_API_URL` base URL (set to `http://localhost:5000/api`)
**Backend → MongoDB**: Mongoose connection in `server.js`, models auto-create collections
**Backend → Gemini AI**: Direct HTTP calls via axios in `materialController.js`, no SDK used

## Important Conventions

- **Never hardcode** API URLs - use `import.meta.env.VITE_API_URL` in Frontend, `process.env` in Backend
- **Route order matters** in Express - specific routes (like `/categorize`) must come before parameterized routes (`/:id`)
- **Password validation**: Minimum 6 characters (enforced in User model schema)
- **Date handling**: Schedules use Date objects, frontend date pickers prevent past dates
- **Token persistence**: AuthContext syncs localStorage on login/logout, restores on page refresh
