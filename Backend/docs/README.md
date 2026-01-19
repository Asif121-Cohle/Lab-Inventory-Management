# API Documentation Structure

This directory contains the complete Swagger/OpenAPI documentation for the Lab Inventory Management API.

## 📁 Folder Structure

```
docs/
├── swagger.js              # Main Swagger configuration
├── schemas/                # Reusable data models
│   ├── user.js            # User authentication schemas
│   ├── lab.js             # Laboratory schemas
│   ├── material.js        # Material inventory schemas
│   ├── request.js         # Material request schemas
│   ├── schedule.js        # Lab scheduling schemas
│   └── analytics.js       # Analytics & chat schemas
└── paths/                  # API endpoint documentation
    ├── auth.js            # Authentication endpoints
    ├── labs.js            # Lab management endpoints
    ├── materials.js       # Material CRUD & AI endpoints
    ├── requests.js        # Request management & AI endpoints
    ├── schedules.js       # Schedule management endpoints
    └── analytics.js       # Analytics & chat endpoints
```

## 🚀 Accessing the Documentation

### Interactive UI (Swagger UI)
Visit: **http://localhost:3000/api-docs**

Features:
- 📖 Browse all API endpoints organized by tags
- 🧪 Test endpoints directly from the browser
- 🔐 Authenticate with JWT tokens
- 📝 View request/response schemas
- 💡 See example payloads

### JSON Specification
Visit: **http://localhost:3000/api-docs.json**

Get the raw OpenAPI 3.0 JSON specification for:
- Import into Postman
- Generate API clients
- Integration with other tools

## 🔑 Authentication

Most endpoints require JWT authentication:

1. **Login** via `/api/auth/login` to get a token
2. Click **"Authorize"** button in Swagger UI
3. Enter: `Bearer YOUR_JWT_TOKEN`
4. Now you can test protected endpoints

### Test Credentials
```javascript
// Lab Assistant
username: assistant1
password: 123456

// Student
username: student1
password: 123456

// Professor
username: professor1
password: 123456
```

## 📚 API Endpoints Overview

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Labs
- `GET /api/labs` - Get all labs
- `GET /api/labs/{id}` - Get lab by ID
- `GET /api/labs/{id}/materials` - Get lab materials
- `POST /api/labs` - Create lab (Lab Assistant only)

### Materials
- `GET /api/materials` - Get all materials
- `GET /api/materials/{id}` - Get material by ID
- `POST /api/materials` - Add material with AI categorization
- `PUT /api/materials/{id}` - Update material
- `DELETE /api/materials/{id}` - Delete material
- `POST /api/materials/categorize` - AI categorization
- `POST /api/materials/search` - AI natural language search

### Requests
- `POST /api/requests` - Create material request (Student)
- `GET /api/requests/my-requests` - Get my requests
- `GET /api/requests/pending` - Get pending requests (Assistant)
- `PUT /api/requests/{id}/approve` - Approve request
- `PUT /api/requests/{id}/reject` - Reject request
- `POST /api/requests/ai-suggest` - AI material suggestions

### Schedules
- `GET /api/schedules` - Get all schedules
- `POST /api/schedules` - Create schedule (Professor)
- `GET /api/schedules/check-availability` - Check availability
- `GET /api/schedules/my-schedules` - Get my schedules
- `PUT /api/schedules/{id}` - Update schedule
- `DELETE /api/schedules/{id}` - Cancel schedule

### Chat & Analytics
- `POST /api/chat` - AI chat assistant
- `GET /api/chat/suggestions` - Get chat suggestions
- `GET /api/analytics/data` - Get analytics data
- `POST /api/analytics/generate-summary` - AI analytics summary

## 🤖 AI-Powered Features

The API includes several AI-powered endpoints using Google Gemini:

1. **Material Categorization** - Automatically categorize materials
2. **Natural Language Search** - Search materials using plain English
3. **Material Suggestions** - Get AI suggestions for project requirements
4. **Chat Assistant** - Interactive AI assistant for inventory queries
5. **Analytics Summary** - AI-generated inventory insights

## 🛠️ Customization

### Adding New Endpoints

1. **Define Schema** (if needed)
   - Create/update file in `docs/schemas/`
   - Use JSDoc `@swagger` comments

2. **Document Endpoint**
   - Create/update file in `docs/paths/`
   - Follow OpenAPI 3.0 specification
   - Include examples and descriptions

3. **Auto-reload**
   - Changes are picked up automatically
   - Refresh Swagger UI to see updates

### Example Schema Definition

```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     YourModel:
 *       type: object
 *       required:
 *         - field1
 *       properties:
 *         field1:
 *           type: string
 *           example: value1
 */
```

### Example Path Definition

```javascript
/**
 * @swagger
 * /your-endpoint:
 *   get:
 *     summary: Your endpoint description
 *     tags: [YourTag]
 *     responses:
 *       200:
 *         description: Success response
 */
```

## 📦 Dependencies

- `swagger-ui-express` - Swagger UI rendering
- `swagger-jsdoc` - JSDoc to OpenAPI conversion

## 🔗 References

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [JSDoc Documentation](https://jsdoc.app/)

## 📝 Notes

- All timestamps are in ISO 8601 format
- All IDs use MongoDB ObjectId format (24 hex characters)
- JWT tokens expire after 7 days
- Role-based access control is enforced on protected routes
