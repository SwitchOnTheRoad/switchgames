import { useRef, useState } from 'react'
import { uploadFile } from '../api'

type FileType = 'image' | 'video' | 'any'

interface Props {
  value: string
  onChange: (url: string) => void
  type?: FileType
  label?: string
  placeholder?: string
}

const ACCEPT: Record<FileType, string> = {
  image: 'image/jpeg,image/png,image/gif,image/webp',
  video: 'video/mp4,video/mov,video/webm',
  any: 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/mov,video/webm',
}

export default function FileUpload({ value, onChange, type = 'any', label, placeholder }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')

  const isVideo = value && (value.endsWith('.mp4') || value.endsWith('.mov') || value.endsWith('.webm') || value.includes('stream.mux') || value.includes('cloudfront'))
  const isImage = value && !isVideo

  const handleFile = async (file: File) => {
    if (!file) return
    setUploading(true)
    setError('')
    setProgress(0)

    // Fake progress tick while uploading
    const tick = setInterval(() => setProgress(p => Math.min(p + 8, 88)), 200)

    try {
      const url = await uploadFile(file)
      clearInterval(tick)
      setProgress(100)
      onChange(url)
      setTimeout(() => setProgress(0), 600)
    } catch (e) {
      clearInterval(tick)
      setError(e instanceof Error ? e.message : 'Upload failed')
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {label && <label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">{label}</label>}

      {/* Mode toggle */}
      <div className="flex gap-1 mb-3">
        {(['upload', 'url'] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${mode === m ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white'}`}
          >
            {m === 'upload' ? '↑ Upload File' : '🔗 Paste URL'}
          </button>
        ))}
      </div>

      {mode === 'url' ? (
        <input
          type="url" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          placeholder={placeholder || 'https://...'}
        />
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-2xl transition-colors ${uploading ? 'border-white/30' : 'border-white/10 hover:border-white/25'}`}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT[type]}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />

          {uploading ? (
            <div className="p-6 flex flex-col items-center gap-3">
              <p className="text-sm text-gray-300">Uploading...</p>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-300">{progress}%</p>
            </div>
          ) : value ? (
            <div className="p-3">
              {/* Preview */}
              <div className="rounded-xl overflow-hidden mb-2 relative" style={{ height: 120 }}>
                {isVideo ? (
                  <video key={value} autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src={value} type="video/mp4" />
                  </video>
                ) : isImage ? (
                  <img src={value} alt="Preview" className="w-full h-full object-cover" />
                ) : null}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onChange('') }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full text-xs text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-300 text-center truncate px-2">{value.split('/').pop()}</p>
              <p className="text-xs text-gray-300 text-center mt-1">Click or drag to replace</p>
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-xl liquid-glass border border-white/20 flex items-center justify-center text-lg mb-1">
                {type === 'image' ? '🖼' : type === 'video' ? '🎬' : '📁'}
              </div>
              <p className="text-sm text-white">Drop file here or click to browse</p>
              <p className="text-xs text-gray-300">
                {type === 'image' ? 'JPG, PNG, GIF, WebP' : type === 'video' ? 'MP4, MOV, WebM' : 'Images & Videos'} · Max 100MB
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  )
}
