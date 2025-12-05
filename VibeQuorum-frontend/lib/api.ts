const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

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
  const isAIRequest = endpoint.includes('/ai-draft')
  const timeout = isAIRequest ? 120000 : 30000 // 120s for AI, 30s for others

  const config: RequestInit = {
    method,
    headers,
    signal: AbortSignal.timeout(timeout),
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)
    
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const data: ApiResponse<T> = await response.json()

    if (!data.success) {
      throw new Error(data.error || data.message || 'Request failed')
    }

    return data.data as T
  } catch (error: any) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      throw new Error('Request timeout - server is not responding')
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - unable to connect to server')
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
  },
}

