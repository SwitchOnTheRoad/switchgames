import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

export default function NotFoundPage() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ opacity: 0.06 }}>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="text-center relative z-10 max-w-md">
          <p
            className="font-normal text-white/10 select-none mb-4"
            style={{ fontSize: 'clamp(120px, 30vw, 200px)', letterSpacing: '-0.06em', lineHeight: 1 }}
          >
            404
          </p>
          <h1 className="text-3xl font-normal mb-3" style={{ letterSpacing: '-0.03em', marginTop: '-2rem' }}>
            Page not found.
          </h1>
          <p className="text-gray-300 text-sm mb-8" style={{ lineHeight: 1.7 }}>
            The page you're looking for doesn't exist or was moved.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/">
              <button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm">
                Back to Home
              </button>
            </Link>
            <Link to="/games">
              <button className="liquid-glass border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors text-sm">
                See Games
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
