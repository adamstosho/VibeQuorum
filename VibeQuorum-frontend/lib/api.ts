const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Log API URL in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔗 API URL:', API_URL)
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  walletAddress?: string
  signature?: string
  timestamp?: string
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, walletAddress, signature, timestamp } = options

  // Ensure we have a valid API URL
  const apiUrl = API_URL || 'http://localhost:4000'
  if (!apiUrl) {
    throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL in .env.local')
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (walletAddress) {
    headers['x-wallet-address'] = walletAddress
  }

  if (signature) {
    headers['x-signature'] = signature
  }

  if (timestamp) {
    headers['x-timestamp'] = timestamp
  }

  // Longer timeout for AI requests (120 seconds)
  // Also longer timeout for write operations (POST, PUT, DELETE) which might take longer
  const isAIRequest = endpoint.includes('/ai-draft')
  const isWriteOperation = method !== 'GET'
  const timeout = isAIRequest 
    ? 120000  // 120s for AI requests
    : isWriteOperation 
      ? 30000  // 30s for write operations (POST, PUT, DELETE)
      : 15000  // 15s for read operations (GET)

  // Create AbortController for timeout (more compatible than AbortSignal.timeout)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const config: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  const url = `${apiUrl}${endpoint}`

  try {
    // Log request in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`📤 API Request: ${method} ${url} (timeout: ${timeout/1000}s)`)
    }
    
    const response = await fetch(url, config)
    
    // Clear timeout on successful response
    clearTimeout(timeoutId)
    
    // Log response in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`📥 API Response: ${method} ${url} - Status: ${response.status}`)
    }
    
    if (!response.ok) {
      // Handle rate limiting (429) with retry info
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || response.headers.get('X-RateLimit-Reset')
        let errorMessage = 'Too many requests. Please wait a moment and try again.'
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // If response is not JSON, use default message
        }
        
        // Add retry info if available
        if (retryAfter) {
          errorMessage += ` Retry after ${retryAfter} seconds.`
        }
        
        const rateLimitError = new Error(errorMessage) as any
        rateLimitError.status = 429
        rateLimitError.retryAfter = retryAfter
        throw rateLimitError
      }
      
      // Handle other HTTP errors
      let errorMessage = `Request failed with status ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage
      }
      
      const httpError = new Error(errorMessage) as any
      httpError.status = response.status
      throw httpError
    }

    const data: ApiResponse<T> = await response.json()

    if (!data.success) {
      throw new Error(data.error || data.message || 'Request failed')
    }

    return data.data as T
  } catch (error: any) {
    // Clear timeout on error
    clearTimeout(timeoutId)
    
    // Handle network errors with more specific messages
    if (error.name === 'AbortError' || error.name === 'TimeoutError' || error.message?.includes('timeout') || error.message?.includes('aborted')) {
      const errorMsg = `⏱️ Request timeout (${timeout/1000}s) - The server at ${apiUrl} is not responding. 

Troubleshooting:
1. Check if backend is running: curl ${apiUrl}/health
2. Backend might be slow - try again in a moment
3. Check backend logs for errors
4. Verify NEXT_PUBLIC_API_URL in .env.local: ${apiUrl}`
      console.error(errorMsg, { endpoint, url, timeout, method })
      throw new Error(`Request timeout after ${timeout/1000} seconds. The backend server may be slow or not responding.`)
    }
    
    // Handle fetch failures (network errors, CORS, etc.)
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      const errorMsg = `🌐 Network error - Unable to connect to ${apiUrl}

Troubleshooting steps:
1. ✅ Check if backend server is running: curl http://localhost:4000/health
2. ✅ Verify NEXT_PUBLIC_API_URL in .env.local is set to: http://localhost:4000
3. ✅ Restart frontend dev server after adding NEXT_PUBLIC_API_URL
4. ✅ Check CORS configuration in backend
5. ✅ Ensure both servers are running (backend:4000, frontend:3000)
6. ✅ Check browser console Network tab for detailed error

Current API URL: ${apiUrl}
Request URL: ${url}
Environment: ${process.env.NODE_ENV}`
      console.error(errorMsg, { 
        endpoint, 
        url, 
        apiUrl: apiUrl,
        apiUrlEnv: process.env.NEXT_PUBLIC_API_URL,
        error: error.message,
        errorName: error.name,
        stack: error.stack 
      })
      throw new Error(`Cannot connect to backend server at ${apiUrl}. Make sure the server is running and NEXT_PUBLIC_API_URL is set correctly.`)
    }
    
    // Handle rate limit errors specifically
    if (error.status === 429 || error.message?.includes('Too many requests')) {
      const retryAfter = error.retryAfter || 60 // Default to 60 seconds
      console.warn(`⚠️ Rate limit exceeded. Retry after ${retryAfter} seconds.`, { endpoint, url })
      throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`)
    }
    
    // Re-throw other errors with better context
    if (error.message) {
      console.error('❌ API request error:', { 
        endpoint, 
        url, 
        method,
        error: error.message, 
        status: error.status,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    } else {
      console.error('❌ API request error (unknown):', { endpoint, url, method, error })
    }
    throw error
  }
}

export const api = {
  // Questions
  questions: {
    list: (params?: { page?: number; limit?: number; tag?: string; search?: string; sort?: string }) => {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      if (params?.tag) query.append('tag', params.tag)
      if (params?.search) query.append('search', params.search)
      if (params?.sort) query.append('sort', params.sort)
      // Backend returns: { success: true, data: questions[], pagination: {...} }
      // request() extracts data, so we get questions[] directly
      // But we need to handle both array and object formats
      return request<any[] | { questions: any[]; pagination?: any }>(`/api/questions?${query.toString()}`)
    },
    get: (id: string) => request<{ question: any }>(`/api/questions/${id}`),
    create: (data: { title: string; description: string; tags: string[] }, walletAddress: string, signature?: string, timestamp?: string) =>
      request<{ question: any }>('/api/questions', { method: 'POST', body: data, walletAddress, signature, timestamp }),
    update: (id: string, data: { title?: string; description?: string; tags?: string[] }, walletAddress: string, signature?: string, timestamp?: string) =>
      request(`/api/questions/${id}`, { method: 'PUT', body: data, walletAddress, signature, timestamp }),
    delete: (id: string, walletAddress: string, signature?: string, timestamp?: string) =>
      request(`/api/questions/${id}`, { method: 'DELETE', walletAddress, signature, timestamp }),
    acceptAnswer: (questionId: string, answerId: string, walletAddress: string, signature?: string, timestamp?: string) =>
      request(`/api/questions/${questionId}/accept/${answerId}`, { method: 'POST', walletAddress, signature, timestamp }),
  },

  // Answers
  answers: {
    list: (questionId: string) => request<{ answers: any[] }>(`/api/questions/${questionId}/answers`),
    get: (id: string) => request(`/api/answers/${id}`),
    create: (questionId: string, data: { content: string; aiGenerated?: boolean }, walletAddress: string, signature?: string, timestamp?: string) =>
      request(`/api/questions/${questionId}/answers`, { method: 'POST', body: data, walletAddress, signature, timestamp }),
    update: (id: string, data: { content: string }, walletAddress: string, signature?: string, timestamp?: string) =>
      request(`/api/answers/${id}`, { method: 'PUT', body: data, walletAddress, signature, timestamp }),
    delete: (id: string, walletAddress: string, signature?: string, timestamp?: string) =>
      request(`/api/answers/${id}`, { method: 'DELETE', walletAddress, signature, timestamp }),
  },

  // Voting
  votes: {
    vote: (type: 'question' | 'answer', id: string, value: 1 | -1, walletAddress: string, signature?: string, timestamp?: string) =>
      request(`/api/${type === 'question' ? 'questions' : 'answers'}/${id}/vote`, { method: 'POST', body: { value }, walletAddress, signature, timestamp }),
    remove: (type: 'question' | 'answer', id: string, walletAddress: string, signature?: string, timestamp?: string) =>
      request(`/api/votes/${type}/${id}`, { method: 'DELETE', walletAddress, signature, timestamp }),
    getUserVote: (type: 'question' | 'answer', id: string, walletAddress?: string) =>
      request<{ vote: number | null }>(`/api/votes/${type}/${id}`, { walletAddress }),
  },

  // AI
  ai: {
    generateDraft: (questionId: string, options?: { maxTokens?: number; temperature?: number }, walletAddress?: string, signature?: string, timestamp?: string) =>
      request(`/api/questions/${questionId}/ai-draft`, { method: 'POST', body: { options }, walletAddress, signature, timestamp }),
    getStats: (walletAddress?: string) => request(`/api/ai/stats`, { walletAddress }),
  },

  // Auth
  auth: {
    connect: (walletAddress: string, signature?: string, timestamp?: string) =>
      request('/api/auth/connect', { method: 'POST', body: { walletAddress }, walletAddress, signature, timestamp }),
    me: (walletAddress?: string) => request('/api/auth/me', { walletAddress }),
    updateProfile: (data: { displayName?: string; bio?: string }, walletAddress: string, signature?: string, timestamp?: string) =>
      request('/api/auth/profile', { method: 'PUT', body: data, walletAddress, signature, timestamp }),
  },

  // Rewards
  rewards: {
    getBalance: (walletAddress?: string) => request('/api/rewards/balance', { walletAddress }),
    getHistory: (walletAddress?: string) => request('/api/rewards/history', { walletAddress }),
    triggerReward: (answerId: string, walletAddress: string, signature?: string, timestamp?: string) =>
      request('/api/rewards/trigger', { method: 'POST', body: { answerId }, walletAddress, signature, timestamp }),
  },
}

