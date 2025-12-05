# Backend API Testing Guide

## Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:4000/health
```

### 2. Get Questions (Public)
```bash
curl http://localhost:4000/api/questions
```

### 3. Connect Wallet (Create/Get User)
```bash
curl -X POST http://localhost:4000/api/auth/connect \
  -H "x-wallet-address: 0x742d35Cc6634C0532925a3b844Bc9e7595f89Ac" \
  -H "Content-Type: application/json"
```

### 4. Create Question
```bash
curl -X POST http://localhost:4000/api/questions \
  -H "x-wallet-address: 0x742d35Cc6634C0532925a3b844Bc9e7595f89Ac" \
  -H "x-signature: 0x1234..." \
  -H "x-timestamp: $(date +%s)000" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Question",
    "description": "This is a test question description",
    "tags": ["solidity", "test"]
  }'
```

### 5. Get Question by ID
```bash
curl http://localhost:4000/api/questions/QUESTION_ID_HERE
```

### 6. Generate AI Draft
```bash
curl -X POST http://localhost:4000/api/questions/QUESTION_ID/ai-draft \
  -H "x-wallet-address: 0x742d35Cc6634C0532925a3b844Bc9e7595f89Ac" \
  -H "x-signature: 0x1234..." \
  -H "x-timestamp: $(date +%s)000" \
  -H "Content-Type: application/json" \
  -d '{"options": {}}'
```

### 7. Create Answer
```bash
curl -X POST http://localhost:4000/api/questions/QUESTION_ID/answers \
  -H "x-wallet-address: 0x742d35Cc6634C0532925a3b844Bc9e7595f89Ac" \
  -H "x-signature: 0x1234..." \
  -H "x-timestamp: $(date +%s)000" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is my answer to the question",
    "aiGenerated": false
  }'
```

### 8. Vote on Answer
```bash
curl -X POST http://localhost:4000/api/answers/ANSWER_ID/vote \
  -H "x-wallet-address: 0x742d35Cc6634C0532925a3b844Bc9e7595f89Ac" \
  -H "x-signature: 0x1234..." \
  -H "x-timestamp: $(date +%s)000" \
  -H "Content-Type: application/json" \
  -d '{"value": 1}'
```

### 9. Get Token Balance
```bash
curl http://localhost:4000/api/rewards/balance \
  -H "x-wallet-address: 0x742d35Cc6634C0532925a3b844Bc9e7595f89Ac"
```

## Swagger UI Testing

Visit: http://localhost:4000/api-docs

Use the "Authorize" button to add:
- `x-wallet-address`: Your wallet address
- `x-signature`: Signature (optional for read operations)
- `x-timestamp`: Current timestamp

## Frontend Integration Checklist

### ✅ Implemented Endpoints

- [x] `GET /api/questions` - List questions
- [x] `GET /api/questions/:id` - Get question
- [x] `POST /api/questions` - Create question
- [x] `GET /api/questions/:questionId/answers` - Get answers
- [x] `POST /api/questions/:questionId/answers` - Create answer
- [x] `POST /api/questions/:id/ai-draft` - Generate AI draft
- [x] `POST /api/answers/:id/vote` - Vote on answer
- [x] `POST /api/questions/:id/accept/:answerId` - Accept answer
- [x] `GET /api/auth/me` - Get current user
- [x] `POST /api/auth/connect` - Connect wallet
- [x] `GET /api/rewards/balance` - Get token balance
- [x] `GET /api/rewards/history` - Get reward history

### Frontend Needs to Add

1. **API Client** - Create a service to call backend
2. **Environment Variable** - `NEXT_PUBLIC_API_URL=http://localhost:4000`
3. **Replace Static Data** - Connect to real API endpoints
4. **Error Handling** - Handle API errors gracefully

## Example Frontend API Client

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = {
  async getQuestions(params?: { page?: number; tag?: string; sort?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/api/questions?${query}`);
    return res.json();
  },
  
  async createQuestion(data: { title: string; description: string; tags: string[] }, wallet: string) {
    const res = await fetch(`${API_URL}/api/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': wallet,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async generateAIDraft(questionId: string, wallet: string) {
    const res = await fetch(`${API_URL}/api/questions/${questionId}/ai-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': wallet,
      },
      body: JSON.stringify({ options: {} }),
    });
    return res.json();
  },
};
```



