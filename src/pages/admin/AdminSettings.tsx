import { useState, useEffect } from 'react'
import { getSiteSettings, updateSiteSettings } from '../../api'
import type { SiteSettings } from '../../types'

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getSiteSettings()
      .then(data => {
        setSettings(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load settings:', err)
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    setMessage('')
    try {
      const updated = await updateSiteSettings({ youtubeHeroLink: settings.youtubeHeroLink })
      setSettings(updated)
      setMessage('Settings saved successfully.')
    } catch (err) {
      console.error(err)
      setMessage('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!settings) return <div>Failed to load settings.</div>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">Site Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-lg font-medium mb-4">Hero Section</h2>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">YouTube Video Link (Embed URL)</label>
            <input
              type="text"
              value={settings.youtubeHeroLink}
              onChange={e => setSettings({ ...settings, youtubeHeroLink: e.target.value })}
              placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">
              Provide the full embed URL. If left empty, the video will not be shown.
            </p>
          </div>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-white text-black font-medium text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
