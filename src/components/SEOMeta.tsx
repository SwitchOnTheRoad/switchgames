import { useEffect } from 'react'

interface Props {
  title?: string
  description?: string
  image?: string
  url?: string
}

const SITE = 'Switch'
const DEFAULT_DESC = 'UGC game development studio. We build games for culture, and operate them for the long term.'
const DEFAULT_IMAGE = '/logo.png'

export default function SEOMeta({ title, description = DEFAULT_DESC, image = DEFAULT_IMAGE, url }: Props) {
  const fullTitle = title ? `${title} | ${SITE}` : `${SITE} | UGC Game Development`

  useEffect(() => {
    document.title = fullTitle
    setMeta('description', description)
    setMeta('og:title', fullTitle)
    setMeta('og:description', description)
    setMeta('og:image', image)
    setMeta('og:type', 'website')
    if (url) setMeta('og:url', url)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description)
    setMeta('twitter:image', image)
  }, [fullTitle, description, image, url])

  return null
}

function setMeta(name: string, content: string) {
  const isOg = name.startsWith('og:') || name.startsWith('twitter:')
  const attr = isOg ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
