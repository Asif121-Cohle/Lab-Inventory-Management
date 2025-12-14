# ⚡ Quick Setup Guide - AI Smart Item Categorization

## 🚀 Get Started in 5 Minutes

### 1️⃣ Backend Setup (2 min)
```bash
cd Backend

# Create .env from template
cp .env.example .env

# Add your Gemini API key to .env:
# GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Install and run
npm install
npm run dev
# ✅ Server running on http://localhost:5000
```

### 2️⃣ Frontend Setup (2 min)
```bash
cd Frontend
npm install
npm run dev
# ✅ App running on http://localhost:5173
```

### 3️⃣ Login & Test (1 min)
```
Email:    assistant1@lab.edu
Password: password123
```

---

## 🤖 Test the Feature

1. **Navigate to any Lab** → Click "Electronics Lab" (or any lab)
2. **Click "➕ Add New Material"** card (golden card at top)
3. **Fill Form**:
   - Name: `USB-C Cable`
   - Description: `High-speed data and power cable`
   - Leave category empty
4. **Click "🤖 AI Smart Categorization"**
5. **Watch Magic** ✨ (1-3 seconds)
   - Category auto-fills: `Electronic Component`
   - Tags auto-fill: `cable, connector, usb-c, power`
6. **Click "✓ Add Item"**
7. **Search** for "cable" in search bar
8. **See Result** - Item appears filtered!

---

## 📋 Files Modified/Created

**New Files**:
- `Frontend/src/pages/addItemModal.jsx`
- `Frontend/src/components/addItemCard.jsx`
- `Frontend/src/components/materialsSearch.jsx`
- `Frontend/src/pages/CSS/addItemModal.css`
- `Frontend/src/pages/CSS/addItemCard.css`
- `Backend/.env.example`

**Updated Files**:
- `Frontend/src/pages/labDetailPage.jsx`
- `Backend/controllers/materialController.js` (added handler)
- `Backend/routes/materials.js` (added route)

---

## 🔑 Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Get API Key"
3. Create or select Google Cloud Project
4. Copy key → Paste in `Backend/.env`
5. Done! ✅

---

## ✅ Verify It Works

```bash
# Test the categorization endpoint directly
curl -X POST http://localhost:5000/api/materials/categorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Oscilloscope","description":"Electronic test equipment"}'

# Expected response:
# {"category":"Equipment","tags":["electronic","test-equipment","measurement"]}
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Add Item" button not visible | Make sure you're logged in as `assistant1@lab.edu` (role: lab_assistant) |
| "Failed to categorize" | Check `GEMINI_API_KEY` in `Backend/.env` is valid |
| 404 on `/categorize` endpoint | Restart backend server after route changes |
| No filters showing | Materials need tags/categories (add new items with AI) |

---

## 📚 Full Docs

- **Setup Details**: See `AI_CATEGORIZATION_FEATURE.md`
- **Testing Guide**: See `AI_TESTING_GUIDE.md`
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md`

---

## 🎉 That's It!

You now have AI-powered material categorization in your lab inventory system!

**Next Steps**:
1. ✅ Add some materials and see AI in action
2. ✅ Try different searches and filters
3. ✅ Test with different user roles
4. ✅ Read full documentation for advanced features
5. ✅ Deploy to production when ready

---

Need help? Check the troubleshooting section or refer to the detailed guides. Happy categorizing! 🚀
