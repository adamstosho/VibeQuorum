/**
 * API Health Check Utility
 * Use this to check if the backend server is available before making requests
 */

// Smart API URL detection (same logic as api.ts)
function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:4000'
    }
    return '' // Relative URLs in production
  }
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    return ''
  }
  return 'http://localhost:4000'
}

const API_URL = getApiUrl()

export async function checkApiHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const healthUrl = API_URL ? `${API_URL}/health` : '/health'
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      return { healthy: true, message: 'Backend server is running' }
    } else {
      return { healthy: false, message: `Backend server returned status ${response.status}` }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { healthy: false, message: 'Backend server is not responding (timeout)' }
    }
    return {
      healthy: false,
      message: `Cannot connect to backend server at ${API_URL}. Make sure it's running on port 4000.`,
    }
  }
}
