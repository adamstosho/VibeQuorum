/**
 * API Health Check Utility
 * Use this to check if the backend server is available before making requests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function checkApiHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${API_URL}/health`, {
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
