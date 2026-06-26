import { Link } from 'react-router-dom'
import NewsletterSignup from './NewsletterSignup'

export default function Footer() {
  return (
    <footer className="bg-black px-6 md:px-12 lg:px-16 pt-16 pb-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Newsletter */}
        <div className="mb-16">
          <NewsletterSignup />
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
          <div>
            <img src="/logo.png" alt="Switch" className="h-10 w-10 object-contain mb-3" />
            <p className="text-sm text-gray-500 max-w-xs" style={{ lineHeight: 1.65 }}>
              UGC game development for culture and the communities that shape it.
            </p>
          </div>
          <div className="flex gap-10 md:gap-16 text-sm flex-wrap">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Studio</p>
              <Link to="/games" className="text-gray-400 hover:text-white transition-colors">Games</Link>
              <Link to="/work" className="text-gray-400 hover:text-white transition-colors">Work</Link>
              <Link to="/team" className="text-gray-400 hover:text-white transition-colors">Team</Link>
              <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Company</p>
              <Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link>
              <Link to="/press" className="text-gray-400 hover:text-white transition-colors">Press</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Social</p>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter / X</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Roblox</a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-gray-500">© 2026 Switch. playswitchgames.com</p>
          <div className="flex flex-wrap gap-6 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/press" className="hover:text-white transition-colors">Press</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
