# 📊 MongoDB Connection Logging Guide

## ✅ Các File Đã Tạo

### 1. **database-logger.ts** - Logger chuyên cho kết nối MongoDB
```
src/common/logger/database-logger.ts
```

### 2. **db.logger.ts** - Helper cho các operation database
```
src/common/logger/db.logger.ts
```

### 3. **app.module.ts** - Cập nhật với logging chi tiết
### 4. **main.ts** - Cập nhật bootstrap logging

---

## 🚀 Cách Sử Dụng

### 1️⃣ **Khi Khởi Động Server**
Chạy server để thấy log connection:
```bash
npm run start:dev
```

**Output sẽ hiển thị:**
```
🚀 Bootstrap
════════════════════════════════════════════════════════
🎮 REVEAL QUIZ RACE API
Node Environment: development
Timestamp: 2025-05-29T...
════════════════════════════════════════════════════════

🔗 MongoDB Connection
════════════════════════════════════════════════════════
📡 Starting MongoDB Connection
URI: mongodb+srv://***:***@cluster0...
Timestamp: 2025-05-29T...
════════════════════════════════════════════════════════

✅ MongoDB Connected Successfully
✓ Connection Established
✓ Database Ready
Timestamp: 2025-05-29T...
════════════════════════════════════════════════════════

🌐 Starting server on port 5000...
✅ Server is running!
🔗 URL: http://localhost:5000
📡 Real-time: ws://localhost:5000
════════════════════════════════════════════════════════
```

---

## 📝 Sử Dụng Logging Trong Service

### Ví dụ trong Quiz Service:

```typescript
import { DbLogger } from '../../../common/logger/db.logger';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
  ) {}

  async create(createQuizDto: CreateQuizDto) {
    // Bắt đầu timer
    const timer = DbLogger.startTimer('Create Quiz');

    try {
      const quiz = await this.quizModel.create(createQuizDto);
      DbLogger.logInsert('quizzes', quiz._id.toString());
      DbLogger.endTimer(timer, 'Quiz created successfully');
      return quiz;
    } catch (error) {
      DbLogger.logError('quizzes', 'create', error);
      throw error;
    }
  }

  async findAll() {
    const timer = DbLogger.startTimer('Get All Quizzes');
    
    try {
      const quizzes = await this.quizModel.find().exec();
      DbLogger.logFind('quizzes', {}, quizzes.length);
      DbLogger.endTimer(timer, `Found ${quizzes.length} quizzes`);
      return quizzes;
    } catch (error) {
      DbLogger.logError('quizzes', 'findAll', error);
      throw error;
    }
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    const timer = DbLogger.startTimer(`Update Quiz ${id}`);
    
    try {
      const result = await this.quizModel.findByIdAndUpdate(
        id,
        updateQuizDto,
        { new: true },
      );
      DbLogger.logUpdate('quizzes', id);
      DbLogger.endTimer(timer, 'Quiz updated');
      return result;
    } catch (error) {
      DbLogger.logError('quizzes', 'update', error);
      throw error;
    }
  }

  async remove(id: string) {
    const timer = DbLogger.startTimer(`Delete Quiz ${id}`);
    
    try {
      await this.quizModel.findByIdAndDelete(id);
      DbLogger.logDelete('quizzes', id);
      DbLogger.endTimer(timer, 'Quiz deleted');
    } catch (error) {
      DbLogger.logError('quizzes', 'remove', error);
      throw error;
    }
  }
}
```

---

## 🔍 Loại Log Khác Nhau

### Connection Logs (Khi khởi động)
```
🔗 MongoDB Connection
📡 Starting MongoDB Connection
✅ MongoDB Connected Successfully
```

### Operation Logs (Khi thực hiện query)
```
▶️ Starting: Create Quiz
✓ [45ms] Create Quiz - Quiz created successfully
🔍 Find in 'quizzes': 5 result(s)
➕ Inserted into 'quizzes': 507f1f77bcf86cd799439011
✏️ Updated in 'quizzes': 507f1f77bcf86cd799439011
🗑️ Deleted from 'quizzes': 507f1f77bcf86cd799439011
```

### Error Logs
```
❌ MongoDB Connection Failed
❌ Error in 'quizzes' (create): Cast to ObjectId failed
```

### Performance Warnings
```
⚠️ Slow Query (1250ms): [Query Details]
```

---

## 🎛️ Connection Options Configured

```typescript
{
  "retryWrites": true,              // Automatic retry on write failure
  "w": "majority",                  // Wait for majority nodes
  "journal": true,                  // Use journaling
  "serverSelectionTimeoutMS": 10000, // 10s server selection timeout
  "connectTimeoutMS": 10000,        // 10s connection timeout
  "retryAttempts": 5,               // Max 5 retry attempts
  "retryDelay": 5000                // 5s between retries
}
```

---

## 🧪 Testing MongoDB Connection

### Dùng Postman Collection Đã Tạo:
```
Backend/postman-collection.json
```

**Test lên:**
1. GET `/` - Health check
2. GET `/quizzes` - Get all quizzes (test read)
3. POST `/quizzes` - Create quiz (test write)

Sẽ thấy log chi tiết cho mỗi operation.

---

## 📋 Log Monitoring

Để theo dõi log real-time:
```bash
# Development mode
npm run start:dev

# Production mode
npm run start
```

Hoặc dùng PM2:
```bash
pm2 start npm --name "quiz-api" -- start:dev
pm2 logs quiz-api
```

---

## 🔗 Connection Status Events

Service tự động log các sự kiện:
- ✅ **connected** - Kết nối thành công
- ⚠️ **disconnected** - Mất kết nối
- 🔄 **reconnected** - Kết nối lại thành công
- ❌ **error** - Lỗi kết nối

---

## 📌 Notes

- ✅ Tất cả URI credentials đã được mask (ẩn)
- ✅ Log tự động track performance (warning nếu > 1s)
- ✅ Tất cả error đều được capture với full stack trace
- ✅ Connection retry tự động (5 lần, interval 5s)

---

## 🚀 Next Steps

Để sử dụng logging trong các service khác:

1. Import `DbLogger` từ `src/common/logger/db.logger`
2. Wrap database operations với `DbLogger.startTimer()` và `DbLogger.endTimer()`
3. Log specific operations (insert, update, delete, find)
4. Catch errors với `DbLogger.logError()`

Tất cả log sẽ tự động hiển thị trong console với emoji và formatting đẹp! 🎨
