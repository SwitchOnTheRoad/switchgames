export interface Game {
  id: string
  title: string
  genre: string
  description: string
  videoUrl: string
  imageUrl?: string
  robloxUrl?: string
  visits: string
  featured: boolean
  comingSoon: boolean
  createdAt: string
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverVideoUrl: string
  publishedAt: string
  published: boolean
  author: string
}

export interface Job {
  id: string
  title: string
  department: string
  type: string
  location: string
  description: string
  requirements: string
  open: boolean
  createdAt: string
}

export interface Contact {
  id: string
  name: string
  email: string
  company: string
  enquiryType: string
  message: string
  createdAt: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  imageUrl?: string
  twitter?: string
  linkedin?: string
  order: number
}

export interface CaseStudy {
  id: string
  slug: string
  brand: string
  title: string
  excerpt: string
  challenge: string
  solution: string
  results: string
  coverVideoUrl?: string
  coverImageUrl?: string
  tags: string[]
  publishedAt: string
  published: boolean
}

export interface JobApplication {
  id: string
  jobId: string
  jobTitle: string
  name: string
  email: string
  phone?: string
  location?: string
  portfolio?: string
  linkedIn?: string
  coverLetter: string
  cvUrl?: string
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected'
  createdAt: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  createdAt: string
}

export interface SiteSettings {
  id: string
  youtubeHeroLink: string
}
