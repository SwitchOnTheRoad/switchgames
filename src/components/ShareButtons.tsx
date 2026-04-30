interface Props {
  title: string
  url?: string
}

export default function ShareButtons({ title, url }: Props) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const encoded = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl })
        return
      } catch { /* fell through */ }
    }
    await navigator.clipboard.writeText(shareUrl)
    alert('Link copied!')
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-gray-300 mr-1">Share</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank" rel="noopener noreferrer"
        className="liquid-glass rounded-lg px-3 py-1.5 border border-white/20 text-xs text-gray-300 hover:text-white transition-colors"
      >
        X / Twitter
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank" rel="noopener noreferrer"
        className="liquid-glass rounded-lg px-3 py-1.5 border border-white/20 text-xs text-gray-300 hover:text-white transition-colors"
      >
        LinkedIn
      </a>
      <button
        onClick={share}
        className="liquid-glass rounded-lg px-3 py-1.5 border border-white/20 text-xs text-gray-300 hover:text-white transition-colors"
      >
        Copy Link
      </button>
    </div>
  )
}
