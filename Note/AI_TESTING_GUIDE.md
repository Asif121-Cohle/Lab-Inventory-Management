# 🚀 AI Smart Item Categorization - Testing Guide

## Quick Start

### Step 1: Configure Backend
```bash
cd Backend

# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here

npm install
npm run dev
```

### Step 2: Start Frontend
```bash
cd Frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Step 3: Login as Lab Assistant
- Email: `assistant1@lab.edu` (or signup a new lab_assistant)
- Password: `password123` (if using default seeds)
- Role: **lab_assistant**

---

## Full Testing Workflow

### Test 1: Add Material with AI Categorization

**Scenario**: Add a new battery item to Electronics Lab

1. Navigate to any lab detail page (e.g., "Electronics Lab")
2. Scroll to materials section
3. Click the **"➕ Add New Material"** card (golden card with plus icon)
4. Modal opens with form

**Fill the form**:
```
Item Name:        9V Alkaline Battery
Description:      Standard 9V power source for electronic circuits
Category:         (leave empty for now)
Tags:            (leave empty for now)
Quantity:         50
Image Link:       https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/9V_battery.jpg/220px-9V_battery.jpg
```

5. Click **"🤖 AI Smart Categorization"** button
6. Wait 1-3 seconds for Gemini API response
7. Expected result:
   - Category: "Electronic Component"
   - Tags: ["battery", "power-source", "9V", "alkaline"] (or similar)
   - AI Badge appears: "✓ AI Applied"

8. Modify tags if needed (e.g., add "rechargeable" if applicable)
9. Click **"✓ Add Item"** to save
10. Success message appears: "✅ Item added successfully!"
11. Modal closes and new item appears in grid

**Verify**:
- Item appears at top of materials grid
- Shows correct stock (50 in stock)
- Displays category badge "Electronic Component"
- Shows tags under the item name

---

### Test 2: Search & Filter Materials

**Scenario**: Find specific materials using search and filters

1. On lab detail page, ensure materials are loaded
2. Use **search bar** to find "battery"
   - Type "battery" in search input
   - Grid updates in real-time, showing only battery items
   - Search badge appears: "Search: battery"

3. Click **"🔍 Filters"** to expand filter panel
4. Select **Category**: "Electronic Component"
   - Grid narrows down to electronic items
   - Filter badge appears

5. Select **Tags**: Check "power-source" and "9V"
   - Grid further filtered (AND logic within categories)
   - Both tags show as selected with checkmarks

6. View **active filters display**:
   - Shows: Search: "battery", Electronic Component, power-source, 9V

7. Click **"×"** on individual filters to remove them one-by-one
   - Grid updates with each removal

8. Click **"✕ Clear All Filters"**
   - All filters cleared
   - Full material list appears again

**Verify**:
- Search is case-insensitive
- Filters work in combination
- Real-time updates with no lag
- All badges display correctly

---

### Test 3: AI Fallback (No API Key)

**Scenario**: Verify app works even if Gemini API is unavailable

1. Temporarily disable or remove `GEMINI_API_KEY` from `.env`
2. Restart backend
3. Try to add a new material:
   - Fill form normally
   - Click AI categorization button
   - See error: "AI categorization failed"
   - User can still manually select category and tags
   - Submit works with manual inputs

**Verify**:
- Error handling works gracefully
- User can still add items without AI
- System is resilient to API failures

---

### Test 4: Different Item Types

Test categorization for various item types:

#### Test 4a: Equipment
```
Name: Digital Multimeter
Description: Electronic test instrument for measuring voltage, current
Category: Equipment (expected)
```

#### Test 4b: Consumable
```
Name: Filter Paper
Description: For laboratory filtration
Category: Consumable (expected)
```

#### Test 4c: Chemical
```
Name: Sodium Chloride
Description: Common salt for chemistry experiments
Category: Chemical (expected)
```

#### Test 4d: Tool
```
Name: Wire Stripper
Description: Manual tool for removing wire insulation
Category: Tool (expected)
```

**Verify**:
- Each item gets appropriate category
- Tags are relevant to item type
- AI learns context from description

---

### Test 5: Permissions & Access Control

**Scenario**: Verify only lab_assistants can add items

1. **Test as Student**:
   - Login as student1@lab.edu
   - Navigate to lab detail page
   - "➕ Add New Material" card should **NOT be visible**
   - Verify hidden (inspect CSS shows display:none or card absent)

2. **Test as Professor**:
   - Login as professor1@lab.edu
   - Same behavior: card hidden
   - Professor sees materials but can't add

3. **Test as Lab Assistant**:
   - Login as assistant1@lab.edu
   - Card is **visible and clickable**
   - Can add items normally

**Verify**:
- Role-based access working correctly
- Frontend respects role restrictions
- Backend would also reject if someone bypassed frontend

---

### Test 6: Form Validation

**Scenario**: Verify form requires proper inputs

1. Click "➕ Add New Material"
2. Try to submit empty form:
   - Error: "Please fill in all required fields (name, quantity, category)"

3. Fill only name, click "🤖 AI Smart Categorization":
   - Works (description is optional)
   - Category gets populated by AI

4. Try to submit without quantity:
   - Error: "Please fill in all required fields"

5. Try invalid image URL:
   - Image preview fails to load
   - But form submission still works

6. Add special characters in tags:
   - System handles them without error
   - Trimmed and split correctly

**Verify**:
- All validations work
- Error messages are clear
- No crashes with invalid input

---

### Test 7: Material Grid Display

**Scenario**: Verify added materials display correctly in grid

1. Add a new material with full details (name, description, category, tags, image)
2. Material card appears with:
   - ✅ Item image (or placeholder 📦 if missing)
   - ✅ Stock badge ("50 in stock")
   - ✅ Item name (in gold color)
   - ✅ Description (truncated to 80 chars)
   - ✅ Category badge (gold background)
   - ✅ Tags (up to 3 displayed)
   - ✅ "View Details →" button

3. Click on material card → Navigates to material detail page
4. Go back to lab page → Check "Add Item" card still first in grid

**Verify**:
- Grid displays correctly with add card at start
- Material cards show all info properly
- Navigation works smoothly

---

### Test 8: Multiple Labs

**Scenario**: Verify adding items to different labs

1. Go to "Computer Lab" → Add "Keyboard"
   - Categorized as: Equipment
2. Go to "Physics Lab" → Add "Prism"
   - Categorized as: Equipment
3. Go to "Electronics Lab" → Add "Capacitor"
   - Categorized as: Electronic Component

**Verify**:
- Each lab maintains its own materials
- AI categorization works across different contexts
- Items don't bleed between labs

---

## Common Issues & Solutions

### Issue: "Failed to categorize item"
**Solution**:
- Check GEMINI_API_KEY in Backend/.env
- Verify API key is valid at https://aistudio.google.com/app/apikey
- Check backend logs for specific error
- Ensure network connection is active

### Issue: Add Item button not showing
**Solution**:
- Verify you're logged in as lab_assistant (check user.role in localStorage)
- Refresh the page
- Check browser console for errors
- Verify user role in database: `db.users.find()`

### Issue: Categories not saving
**Solution**:
- Check backend Material model has "category" field
- Verify enum values match: ['Equipment', 'Consumable', 'Chemical', 'Tool', 'Electronic Component', 'Other']
- Check database for saved materials: `db.materials.find()`

### Issue: Filters not working
**Solution**:
- Verify materials have tags and category set
- Clear browser cache
- Check that materials were added with new form (old materials may lack tags)
- Re-add a test material to verify

### Issue: Modal won't close
**Solution**:
- Press Escape key
- Click outside modal overlay
- Refresh page
- Check browser console for JavaScript errors

---

## Performance Benchmarks

| Operation | Expected Time | Notes |
|-----------|--------------|-------|
| Load lab detail page | < 1s | Depends on material count |
| AI categorization call | 1-3s | Gemini API response time |
| Form submission | < 1s | Post to backend |
| Search (100 items) | < 100ms | Client-side, instant |
| Filter update | < 50ms | Real-time filtering |
| Grid re-render | < 200ms | React optimization |

---

## Success Criteria Checklist

- [ ] ✅ Add Item card visible only to lab_assistants
- [ ] ✅ AI categorization button triggers Gemini API
- [ ] ✅ Category and tags auto-fill (editable)
- [ ] ✅ Form validates required fields
- [ ] ✅ Material saves with category and tags
- [ ] ✅ Search finds materials by name/description
- [ ] ✅ Filter by category works
- [ ] ✅ Filter by tags works (multi-select)
- [ ] ✅ Active filters display correctly
- [ ] ✅ Clear filters button resets
- [ ] ✅ Grid displays new items correctly
- [ ] ✅ Other users can't see Add button
- [ ] ✅ System works without Gemini API (fallback)
- [ ] ✅ No console errors
- [ ] ✅ Responsive on mobile

---

## Detailed Gemini API Testing

### Test API Endpoint Directly

```bash
# In terminal, test categorization endpoint
curl -X POST http://localhost:5000/api/materials/categorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Oscilloscope",
    "description": "Electronic test equipment for signal analysis"
  }'

# Expected response:
{
  "category": "Equipment",
  "tags": ["electronic", "test-equipment", "measurement"]
}
```

### Verify .env Configuration

```bash
cd Backend
# Check that .env exists
ls -la .env

# Verify API key is set
grep GEMINI_API_KEY .env

# Should output something like:
# GEMINI_API_KEY=AIzaSy...
```

### Monitor Backend Logs

```bash
# Terminal where backend is running
# Should see logs like:
# 
# 🤖 AI categorization called for: Oscilloscope
# ✅ Gemini API response: Equipment, ["electronic", ...]
# ✅ Material added to database
```

---

## Documentation References

- [Google Gemini API Docs](https://ai.google.dev/)
- [Mongoose Query Documentation](https://mongoosejs.com/docs/queries.html)
- [React Hooks Guide](https://react.dev/reference/react)
- [Express Router Documentation](https://expressjs.com/en/guide/routing.html)

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. 📝 Document any bugs found
3. 🔧 Fine-tune AI prompts if categories are inaccurate
4. 📊 Monitor API usage and costs
5. 🚀 Deploy to production
6. 📈 Track user adoption and feedback

Enjoy using the AI-powered Lab Inventory Management System! 🎉
