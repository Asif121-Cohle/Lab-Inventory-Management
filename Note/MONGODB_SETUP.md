# MongoDB Setup Instructions

## Option 1: Start MongoDB Service (Recommended - Windows)

You have MongoDB installed but the service is stopped. To start it:

### As Administrator:
1. **Right-click PowerShell** and select "Run as Administrator"
2. Run: `Start-Service MongoDB`
3. Verify: `Get-Service MongoDB` (should show "Running")

Then come back to this folder and run:
```bash
npm run seed
npm run dev
```

## Option 2: Start MongoDB Manually

If the service won't start, run MongoDB manually:

```bash
mongod --dbpath C:\data\db
```

Leave this terminal open (MongoDB running), then open a **new terminal** and run:
```bash
cd Backend
npm run seed
npm run dev
```

## Option 3: Use MongoDB Atlas (Cloud - Easiest)

If local MongoDB is problematic, use MongoDB Atlas (free tier):

1. **Create account**: https://www.mongodb.com/cloud/atlas/register
2. **Create free cluster** (M0 Sandbox)
3. **Get connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://...`)
   
4. **Update .env file**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lab-inventory?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your database credentials

5. **Run seed and server**:
   ```bash
   npm run seed
   npm run dev
   ```

## Verify MongoDB is Working

Test connection:
```bash
mongosh
```

Should connect without errors. Then run:
```javascript
show dbs
```

## Current Status

✅ Backend code complete
✅ Dependencies installed
❌ MongoDB not running (needs to be started)

## Quick Commands After MongoDB is Running

```bash
# Populate test data
npm run seed

# Start backend server
npm run dev

# Backend will run on http://localhost:5000
```

## Test Credentials (After Seeding)

| Role | Username | Password |
|------|----------|----------|
| Student | student1 | 123456 |
| Professor | professor1 | 123456 |
| Lab Assistant | assistant1 | 123456 |
