import { useEffect, useState } from 'react'
import { getNewsletterSubscribers } from '../../api'
import type { NewsletterSubscriber } from '../../types'

export default function AdminNewsletter() {
  const [subs, setSubs] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNewsletterSubscribers().then(data => setSubs(data.reverse())).finally(() => setLoading(false))
  }, [])

  const copyAll = () => {
    navigator.clipboard.writeText(subs.map(s => s.email).join('\n'))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Newsletter</h1>
          <p className="text-sm text-gray-300 mt-0.5">{subs.length} subscriber{subs.length !== 1 ? 's' : ''}</p>
        </div>
        {subs.length > 0 && (
          <button onClick={copyAll} className="liquid-glass border border-white/20 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-white hover:text-black transition-colors">
            Copy All Emails
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="liquid-glass rounded-xl h-12 animate-pulse border border-white/5" />)}</div>
      ) : subs.length === 0 ? (
        <div className="liquid-glass rounded-2xl border border-white/10 p-16 text-center">
          <p className="text-gray-300">No subscribers yet.</p>
        </div>
      ) : (
        <div className="liquid-glass rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">Email</th>
              <th className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">Subscribed</th>
            </tr></thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < subs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td className="px-6 py-3 text-sm">{s.email}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">{new Date(s.createdAt).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
