# Mental Wellness API Test Suite

This document provides test cases for all implemented API endpoints.

## Authentication Endpoints

### 1. Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### 2. Login User
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Get Profile (Protected)
```bash
# Replace YOUR_JWT_TOKEN with the token from login response
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Refresh Token (Protected)
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Forgot Password
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

## Journal Endpoints (All require authentication)

### 1. Create Journal Entry
```bash
curl -X POST http://localhost:3000/journal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Journal Entry",
    "content": "Today was a great day! I felt really happy and accomplished a lot.",
    "mood": {
      "rating": 8,
      "label": "Happy"
    },
    "tags": ["happy", "productive", "positive"],
    "privacy": "private",
    "activities": ["work", "exercise", "reading"]
  }'
```

### 2. Get All Journal Entries (with pagination and filters)
```bash
# Basic request
curl -X GET "http://localhost:3000/journal" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# With filters and pagination
curl -X GET "http://localhost:3000/journal?page=1&limit=5&search=happy&moodRatingMin=7&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Single Journal Entry
```bash
# Replace JOURNAL_ENTRY_ID with actual entry ID
curl -X GET http://localhost:3000/journal/JOURNAL_ENTRY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Update Journal Entry
```bash
curl -X PATCH http://localhost:3000/journal/JOURNAL_ENTRY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Title",
    "mood": {
      "rating": 9,
      "label": "Very Happy"
    },
    "isFavorite": true
  }'
```

### 5. Delete Journal Entry
```bash
curl -X DELETE http://localhost:3000/journal/JOURNAL_ENTRY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Archive Journal Entry
```bash
curl -X PATCH http://localhost:3000/journal/JOURNAL_ENTRY_ID/archive \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Unarchive Journal Entry
```bash
curl -X PATCH http://localhost:3000/journal/JOURNAL_ENTRY_ID/unarchive \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Toggle Favorite
```bash
curl -X PATCH http://localhost:3000/journal/JOURNAL_ENTRY_ID/favorite \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Get Mood Analytics
```bash
# All time mood analytics
curl -X GET "http://localhost:3000/journal/analytics/mood" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Mood analytics for date range
curl -X GET "http://localhost:3000/journal/analytics/mood?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 10. Get Popular Tags
```bash
curl -X GET "http://localhost:3000/journal/analytics/tags?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 11. Share Journal Entry
```bash
curl -X POST http://localhost:3000/journal/JOURNAL_ENTRY_ID/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userIds": ["USER_ID_1", "USER_ID_2"]
  }'
```

### 12. Get Shared Entries
```bash
curl -X GET http://localhost:3000/journal/shared \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing Workflow

1. **Register a new user** to get started
2. **Login** to get JWT token
3. **Create several journal entries** with different moods and tags
4. **Test filtering and pagination** on the journal entries endpoint
5. **Update and modify** entries
6. **Archive/unarchive** entries
7. **Get analytics** to see mood trends and popular tags

## Expected Response Formats

### Authentication Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1e2a1b2c3d4e5f6789abc",
    "email": "test@example.com",
    "username": "testuser",
    "profilePicture": "",
    "isEmailVerified": false
  }
}
```

### Journal Entry Response
```json
{
  "_id": "64f1e2a1b2c3d4e5f6789abc",
  "user": "64f1e2a1b2c3d4e5f6789def",
  "title": "My First Journal Entry",
  "content": "Today was a great day!",
  "mood": {
    "rating": 8,
    "label": "Happy"
  },
  "tags": ["happy", "productive"],
  "privacy": "private",
  "isArchived": false,
  "isFavorite": false,
  "activities": ["work", "exercise"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Mood Analytics Response
```json
{
  "averageMood": 7.5,
  "moodDistribution": {
    "Happy": 5,
    "Neutral": 3,
    "Sad": 2
  },
  "moodTrend": [
    { "date": "2024-01-15", "mood": 8.0 },
    { "date": "2024-01-16", "mood": 7.0 }
  ],
  "totalEntries": 10
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Journal entry not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "mood.rating must be a number conforming to the specified constraints",
    "title should not be empty"
  ],
  "error": "Bad Request"
}
```
