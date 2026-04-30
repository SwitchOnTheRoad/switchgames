// Lightweight analytics — tracks page views and events to local db
const BASE = '/api'

function getBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Other'
}

function getDevice(): string {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

export async function trackPageView(path: string) {
  try {
    await fetch(`${BASE}/pageviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        path,
        referrer: document.referrer || 'direct',
        browser: getBrowser(),
        device: getDevice(),
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
      }),
    })
  } catch { /* silent fail */ }
}

export async function trackEvent(name: string, data?: Record<string, string>) {
  try {
    await fetch(`${BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        name,
        data: data || {},
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
      }),
    })
  } catch { /* silent fail */ }
}
