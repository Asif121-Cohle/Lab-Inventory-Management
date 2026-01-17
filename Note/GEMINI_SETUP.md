# 🔑 Setting Up Gemini API Key

## Problem Fixed

The AI categorization wasn't working because:
1. ❌ GEMINI_API_KEY not set in `Backend/.env`
2. ❌ Lab lookup was trying to cast "computer-lab" to MongoDB ObjectId

Both issues are now fixed in the code. Follow this guide to enable AI features.

---

## Step 1: Get Your Gemini API Key

### Option A: Quick Setup (Recommended)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Get API Key"**
3. Select or create a Google Cloud project
4. Copy the API key shown

### Option B: Through Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable "Generative Language API"
4. Go to Credentials → Create API Key
5. Copy the key

---

## Step 2: Add Key to Backend

1. Open `Backend/.env` file

2. Add this line:
```env
GEMINI_API_KEY=AIzaSy_YOUR_ACTUAL_KEY_HERE_XXXXXXXXXXXXXXXX
```

3. Replace with your actual key (starts with `AIzaSy`)

4. Save the file

### Example:
```env
MONGODB_URI=mongodb://localhost:27017/lab-inventory-management
JWT_SECRET=your_jwt_secret_key_change_this
GEMINI_API_KEY=AIzaSyDxX1234567890abcdefghijklmnopqrst
PORT=5000
NODE_ENV=development
```

---

## Step 3: Restart Backend

```bash
cd Backend
npm run dev
```

You should see:
```
✅ MongoDB Connected
🤖 Server running on port 5000
```

---

## Step 4: Test It Works

1. Open Frontend: `cd Frontend && npm run dev`
2. Login as: `assistant1@lab.edu` / `password123`
3. Go to any lab (e.g., "Electronics Lab")
4. Click **"➕ Add New Material"** card
5. Enter:
   - Name: `USB-C Cable`
   - Description: `High-speed data and power cable`
6. Click **"🤖 AI Smart Categorization"**
7. Watch the magic! ✨

### Expected Result:
- Category: `Electronic Component`
- Tags: `cable`, `connector`, `usb-c`, `power`

---

## 🔍 Troubleshooting

### Issue: "Failed to categorize item"
**Solution**: Check your API key is correct and has no extra spaces

### Issue: "🔑 Invalid API key"
**Check**: 
- Key starts with `AIzaSy`
- No typos in the key
- Generative Language API is enabled in Google Cloud

### Issue: "⏱️ Rate limited"
**Cause**: Too many API calls in short time
**Solution**: Wait a minute and try again

### Issue: Still getting "Other" category
**Check Backend Logs**:
```bash
# Look for these messages in terminal:
🤖 AI Categorization request for: USB-C Cable
📝 Gemini response: ...
✅ Parsed category: Electronic Component
```

If you see `⚠️ GEMINI_API_KEY not configured`:
- Make sure `.env` file exists
- Key is properly set
- Backend restarted after editing `.env`

---

## Verify Setup

Run this in Backend directory:

```bash
node -e "console.log('API Key:', process.env.GEMINI_API_KEY ? 'SET ✓' : 'NOT SET ❌')"
```

Should output: `API Key: SET ✓`

---

## Free Tier Limits

Google Gemini API has generous free tier:
- **15 requests per minute** (free)
- **500,000 requests per month** (free)
- Plenty for lab use!

---

## API Monitoring

To see if AI categorization is working:

### Check Backend Console
```
🤖 AI Categorization request for: Oscilloscope
📝 Gemini response: {"category":"Equipment","tags":["oscilloscope"...]}
✅ Parsed category: Equipment Tags: ['oscilloscope', 'measurement']
```

### Check Frontend Network Tab (DevTools)
- Open Browser DevTools (F12)
- Go to Network tab
- Add an item → Look for requests:
  - `POST /api/materials/categorize` → Should get category + tags
  - `POST /api/materials` → Should save item

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Other" category with generic tags | API key not set, check Backend logs |
| 401 Unauthorized | Invalid API key format |
| Timeout error | API key valid but slow (try again) |
| Cannot parse JSON | Gemini API format issue (rare) |

---

## Next Steps

Once working:
1. ✅ Add items with AI categorization
2. ✅ Try different item types (chemical, tool, consumable, etc.)
3. ✅ Notice how AI tags improve accuracy
4. ✅ Share feedback!

---

## Getting Help

- **API Issues**: Check Google Cloud Console
- **Code Issues**: Check Backend logs with detailed error messages
- **Testing**: Follow `AI_TESTING_GUIDE.md`

---

**Setup Complete!** Your AI material categorization is now ready to use. 🚀
