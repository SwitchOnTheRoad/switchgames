import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../analytics'

export default function usePageTracking() {
  const location = useLocation()
  useEffect(() => {
    if (!location.pathname.startsWith('/admin')) {
      trackPageView(location.pathname)
    }
  }, [location.pathname])
}
