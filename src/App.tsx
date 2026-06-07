import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'
import CookieBanner from './components/CookieBanner'
import usePageTracking from './hooks/usePageTracking'
import Home from './pages/Home'
import GamesPage from './pages/GamesPage'
import GameDetailPage from './pages/GameDetailPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import ContactPage from './pages/ContactPage'
import CareersPage from './pages/CareersPage'
import TeamPage from './pages/TeamPage'
import PressPage from './pages/PressPage'
import CaseStudiesPage from './pages/CaseStudiesPage'
import CaseStudyDetailPage from './pages/CaseStudyDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminGames from './pages/admin/AdminGames'
import AdminBlog from './pages/admin/AdminBlog'
import AdminCareers from './pages/admin/AdminCareers'
import AdminContacts from './pages/admin/AdminContacts'
import AdminTeam from './pages/admin/AdminTeam'
import AdminCaseStudies from './pages/admin/AdminCaseStudies'
import AdminNewsletter from './pages/admin/AdminNewsletter'
import AdminApplications from './pages/admin/AdminApplications'
import ProtectedRoute from './pages/admin/ProtectedRoute'

import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'

function AppInner() {
  usePageTracking()
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="/games/:id" element={<GameDetailPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/careers" element={<CareersPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/press" element={<PressPage />} />
      <Route path="/work" element={<CaseStudiesPage />} />
      <Route path="/work/:slug" element={<CaseStudyDetailPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="games" element={<AdminGames />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="careers" element={<AdminCareers />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="case-studies" element={<AdminCaseStudies />} />
        <Route path="newsletter" element={<AdminNewsletter />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  const [splash, setSplash] = useState(true)
  return (
    <>
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      <CookieBanner />
      <AppInner />
    </>
  )
}
