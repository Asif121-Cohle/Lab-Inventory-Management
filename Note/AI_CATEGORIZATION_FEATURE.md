# 🤖 AI Smart Item Categorization Feature

## Overview
The Lab Inventory Management System now includes AI-powered smart item categorization using Google Gemini API. Lab assistants can add new materials to labs with automatic categorization and tagging.

## Features Implemented

### 1. **Add Item Card Component**
- **Location**: `/src/components/addItemCard.jsx`
- Golden card with "+" icon displayed in the materials grid
- Visible only to users with `lab_assistant` role
- Click to open add item form

### 2. **Add Item Modal Form**
- **Location**: `/src/pages/addItemModal.jsx`
- **CSS**: `/src/pages/CSS/addItemModal.css`
- **Fields**:
  - Item Name (required)
  - Description (optional)
  - Category (required, auto-suggested by AI)
  - Tags (comma-separated, auto-suggested by AI)
  - Quantity to Order (required)
  - Image Link (optional with preview)

### 3. **AI Categorization**
- **Powered by**: Google Gemini API
- **Categories**: Equipment, Consumable, Chemical, Tool, Electronic Component, Other
- **Process**:
  1. User enters item name and description
  2. Clicks "🤖 AI Smart Categorization" button
  3. Gemini API analyzes the item
  4. Auto-fills category and 2-4 relevant tags (editable)
  5. User can modify before saving

### 4. **Materials Search & Filter**
- **Location**: `/src/components/materialsSearch.jsx`
- **CSS**: `/src/components/CSS/materialsSearch.css`
- **Features**:
  - Text search by name/description
  - Filter by category (Equipment, Consumable, etc.)
  - Filter by tags (multi-select)
  - Real-time filtering
  - Active filters display with individual removal buttons
  - Clear all filters button

## Setup Instructions

### Backend Configuration

1. **Create `.env` file in Backend directory**:
```bash
cp Backend/.env.example Backend/.env
```

2. **Configure environment variables**:
```env
# MongoDB (local or Atlas)
MONGODB_URI=mongodb://localhost:27017/lab-inventory-management

# JWT Secret for authentication
JWT_SECRET=your_jwt_secret_key_change_this

# Google Gemini API Key (Required for AI features)
GEMINI_API_KEY=your_actual_gemini_api_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Getting Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key in your Google Cloud project
4. Copy and paste into `.env` file

### Start Backend
```bash
cd Backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend
```bash
cd Frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## Using the AI Categorization Feature

### Prerequisites
- Logged in as a **lab_assistant** user
- Navigate to any lab detail page (e.g., "Computer Lab")

### Adding an Item

1. **Click the "➕ Add New Material" card** at the top of the materials grid
2. **Fill in the form**:
   - Enter item name (e.g., "9V Alkaline Battery")
   - Optionally add description
   - Click **"🤖 AI Smart Categorization"** button
   - Wait for Gemini API response (~2 seconds)
   - Review and edit the suggested category and tags
   - Enter quantity to order
   - Optionally add image URL
3. **Click "✓ Add Item"** to save

### Searching & Filtering Materials

1. Use the **search bar** to find items by name or description
2. Click **"🔍 Filters"** to expand advanced filters:
   - Select category from dropdown
   - Multi-select tags
   - Multiple filters work together (AND logic within categories, OR for tags)
3. View **active filters** above the grid
4. Click **"×"** on filters to remove individually or **"✕ Clear All Filters"** to reset

## API Endpoints

### New Endpoint: AI Categorization
```
POST /api/materials/categorize
Authorization: Bearer <jwt_token>
Content-Type: application/json

Body:
{
  "name": "9V Battery",
  "description": "Alkaline power source"
}

Response:
{
  "category": "Electronic Component",
  "tags": ["battery", "power-source", "9V"]
}
```

### Add Material (Improved)
```
POST /api/materials
Authorization: Bearer <jwt_token>
Content-Type: application/json

Body:
{
  "name": "9V Battery",
  "description": "Alkaline power source",
  "quantity": 50,
  "labId": "electronics-lab",
  "imageLink": "https://...",
  "category": "Electronic Component",
  "tags": ["battery", "power-source", "9V"]
}

Note: Category and tags are now mandatory
```

## File Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── addItemCard.jsx           ⭐ NEW
│   │   ├── materialsSearch.jsx       ⭐ NEW
│   │   └── CSS/
│   │       └── materialsSearch.css   ⭐ NEW
│   ├── pages/
│   │   ├── labDetailPage.jsx         (UPDATED)
│   │   ├── addItemModal.jsx          ⭐ NEW
│   │   └── CSS/
│   │       ├── labDetail.css         (UPDATED)
│   │       ├── addItemModal.css      ⭐ NEW
│   │       └── addItemCard.css       ⭐ NEW
│   └── ...
├── ...

Backend/
├── controllers/
│   └── materialController.js         (UPDATED)
├── routes/
│   └── materials.js                  (UPDATED)
├── .env.example                      ⭐ NEW
└── ...
```

## Fallback Behavior

If Gemini API is not configured or fails:
- Category defaults to "Other"
- Tags default to ["lab-equipment", "inventory-item"]
- Users can still add items manually without AI

## Features Coming Soon

- [ ] Bulk item import with AI categorization
- [ ] Barcode scanning for quick additions
- [ ] Material usage analytics and predictions
- [ ] Custom category creation by admins
- [ ] Webhook integration for external inventory systems

## Troubleshooting

### "Failed to categorize item" error
- Check GEMINI_API_KEY is set in `.env`
- Ensure API key is valid and has Generative Language API enabled
- Check network connection

### 404 on "/categorize" endpoint
- Verify Backend/routes/materials.js has `/categorize` route before `/:id`
- Restart backend server after route changes

### "Unauthorized" error when adding items
- Only lab_assistants can add items
- Login with a lab_assistant account
- Check JWT token in localStorage

### Filtering shows no results
- Make sure materials have proper tags and categories
- Existing materials added before this feature may need updating
- Re-add materials using new form to get AI tags

## Performance Notes

- Gemini API calls typically take 1-3 seconds
- Filtering is client-side and instant (no API calls)
- Search is case-insensitive and includes partial matches
- Grid updates in real-time as items are added

## Security Considerations

- Gemini API key stored in backend .env (never exposed to frontend)
- Only authenticated users can access categorization
- Only lab_assistants can add/modify materials
- All inputs validated on backend before saving

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Support & Documentation

For issues or feature requests, please refer to the main project README or contact the development team.
