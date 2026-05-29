# 📝 MongoDB Logging - Quick Reference

## 🚀 Khởi Động & Xem Log

```bash
# Development mode (best for debugging)
npm run start:dev

# Production mode
npm run start

# Watch logs in real-time
npm run start:dev | grep -E "✓|✅|❌|⚠️"
```

## 📊 Log Output Examples

### ✅ Connection Success
```
🔗 MongoDB Connection
════════════════════════════════════════════════════════
📡 Starting MongoDB Connection
URI: mongodb+srv://***:***@cluster0.kpik2vs.mongodb.net/
Timestamp: 2025-05-29T10:30:46.234Z
════════════════════════════════════════════════════════

✅ MongoDB Connected Successfully
✓ Connection Established
✓ Database Ready
Timestamp: 2025-05-29T10:30:47.456Z
════════════════════════════════════════════════════════
```

### ❌ Connection Failed
```
🔗 MongoDB Connection
❌ MongoDB Connection Failed
Error: connect ECONNREFUSED 127.0.0.1:27017
Code: ECONNREFUSED
Timestamp: 2025-05-29T10:30:50.789Z
════════════════════════════════════════════════════════
```

### 📝 Query Operations
```
▶️ Starting: Create Quiz
✓ [45ms] Create Quiz - Quiz created successfully
🔍 Find in 'quizzes': 5 result(s) - {}
➕ Inserted into 'quizzes': 507f1f77bcf86cd799439011
✏️ Updated in 'quizzes': 507f1f77bcf86cd799439011
🗑️ Deleted from 'quizzes': 507f1f77bcf86cd799439011
```

### ⚠️ Warnings
```
⚠️ Connection Retry - Attempt 1/5
⚠️ Slow Query (1250ms): find()
⏱️ Connection Timeout - Check your network or MongoDB URI
```

## 🔧 Connection Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| retryAttempts | 5 | Max connection retries |
| retryDelay | 5000ms | Delay between retries |
| serverSelectionTimeoutMS | 10000ms | Server selection timeout |
| connectTimeoutMS | 10000ms | Connection timeout |
| socketTimeoutMS | 45000ms | Socket timeout |
| w | 'majority' | Write concern |
| retryWrites | true | Auto-retry writes |
| journal | true | Use journaling |

## 🔗 Connection Lifecycle Events

```
CONNECTING → (retries if needed)
   ↓
CONNECTED → ✅ Success
   ↓
READY FOR QUERIES

OR

CONNECTING → (error occurs)
   ↓
ERROR → ❌ Failed
   ↓
RETRY (5 times) → Reconnect
```

## 📱 API Test Workflow

### 1️⃣ Health Check
```bash
curl http://localhost:5000/
# Log: ✓ GET / successful
```

### 2️⃣ Read Quiz
```bash
curl http://localhost:5000/quizzes
# Log: 🔍 Find in 'quizzes': 10 result(s)
```

### 3️⃣ Create Quiz
```bash
curl -X POST http://localhost:5000/quizzes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test",...}'
# Logs:
# ▶️ Starting: Create Quiz
# ✓ [23ms] Create Quiz - Quiz created successfully
# ➕ Inserted into 'quizzes': 507f1f77bcf86cd799439010
```

### 4️⃣ Update Quiz
```bash
curl -X PATCH http://localhost:5000/quizzes/[ID] \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated"}'
# Logs:
# ▶️ Starting: Update Quiz [ID]
# ✏️ Updated in 'quizzes': 507f1f77bcf86cd799439010
```

### 5️⃣ Delete Quiz
```bash
curl -X DELETE http://localhost:5000/quizzes/[ID]
# Logs:
# ▶️ Starting: Delete Quiz [ID]
# 🗑️ Deleted from 'quizzes': 507f1f77bcf86cd799439010
```

## 🐛 Troubleshooting

### ❌ Connection ECONNREFUSED
```
❌ MongoDB Connection Failed
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** MongoDB service not running. Check:
- MongoDB connection string in `.env`
- Network connectivity
- MongoDB server status

### ⏱️ Connection Timeout
```
⏱️ Connection Timeout - Check your network or MongoDB URI
```
**Solution:** 
- Verify `.env` MONGODB_URI is correct
- Check internet connection
- MongoDB Atlas whitelist IP if needed

### ⚠️ Slow Queries (>1s)
```
⚠️ Slow Query (1250ms): find()
```
**Solution:**
- Add database indexes
- Optimize query filters
- Check MongoDB performance metrics

## 🎨 Log Levels

| Icon | Level | When |
|------|-------|------|
| ✅ | SUCCESS | Operation succeeded |
| ❌ | ERROR | Operation failed |
| ⚠️ | WARNING | Potential issue (slow, retry) |
| ℹ️ | INFO | Connection events, status |
| 🔍 | DEBUG | Detailed query info |

## 📊 Database Logger Methods

```typescript
import { DatabaseLogger } from 'src/common/logger/database.logger';

const logger = new DatabaseLogger();

// Connection Events
logger.logConnectionStart(uri);        // Starting connection
logger.logConnectionSuccess();         // Connected successfully
logger.logConnectionError(error);      // Connection failed
logger.logDisconnected();              // Lost connection
logger.logReconnected();               // Reconnected

// Operations
logger.logConnectionRetry(1, 5);       // Retry attempt 1/5
logger.logTimeout();                   // Connection timeout
logger.logConnectionOptions({...});    // Show options
```

## 📊 DB Logger Helper Methods

```typescript
import { DbLogger } from 'src/common/logger/db.logger';

// Timing
const timer = DbLogger.startTimer('Operation');
DbLogger.endTimer(timer, 'Success message');

// Operations
DbLogger.logFind('collection', query, resultCount);
DbLogger.logInsert('collection', id);
DbLogger.logUpdate('collection', id);
DbLogger.logDelete('collection', id);
DbLogger.logError('collection', 'operation', error);

// Status
DbLogger.logConnectionStatus('connected', 'details');
```

## 🔐 Environment Variables

```env
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/

# Optional
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

## 📋 Files Modified

| File | Changes |
|------|---------|
| `src/app.module.ts` | Added MongoDB connection logging |
| `src/main.ts` | Added bootstrap process logging |
| `src/common/logger/database.logger.ts` | New: Connection logger |
| `src/common/logger/db.logger.ts` | New: Operation logger helper |

## ✨ Features

✅ Automatic connection logging
✅ Connection retry logic (5 attempts)
✅ Performance monitoring
✅ Secure credentials (masked)
✅ Pretty formatted output
✅ Emoji icons for quick scanning
✅ Detailed timestamps
✅ Error stack traces
✅ Event tracking (connected, disconnected, reconnected)

## 🎯 Best Practices

1. ✅ Always check logs when connection fails
2. ✅ Monitor slow queries (>1s)
3. ✅ Use Postman collection for consistent testing
4. ✅ Check MongoDB Atlas network access if remote
5. ✅ Verify `.env` MONGODB_URI before running
6. ✅ Use `npm run start:dev` for development (better logs)
7. ✅ Check connection retries before giving up

---

**All logging is automatic - no additional setup needed!** 🚀
