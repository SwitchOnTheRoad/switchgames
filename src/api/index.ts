import type { Game, Post, Job, JobApplication, Contact, TeamMember, CaseStudy, NewsletterSubscriber } from '../types'

const BASE = '/api'

// ─── Games ────────────────────────────────────────────────────────────────────
export async function getGames(): Promise<Game[]> {
  const res = await fetch(`${BASE}/games`)
  if (!res.ok) throw new Error('Failed to fetch games')
  return res.json()
}
export async function getGameById(id: string): Promise<Game> {
  const res = await fetch(`${BASE}/games/${id}`)
  if (!res.ok) throw new Error('Game not found')
  return res.json()
}
export async function createGame(data: Omit<Game, 'id'>): Promise<Game> {
  const res = await fetch(`${BASE}/games`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id: crypto.randomUUID() }) })
  if (!res.ok) throw new Error('Failed to create game')
  return res.json()
}
export async function updateGame(id: string, data: Partial<Game>): Promise<Game> {
  const res = await fetch(`${BASE}/games/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to update game')
  return res.json()
}
export async function deleteGame(id: string): Promise<void> {
  await fetch(`${BASE}/games/${id}`, { method: 'DELETE' })
}

// ─── Posts ────────────────────────────────────────────────────────────────────
export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${BASE}/posts`)
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}
export async function getPostBySlug(slug: string): Promise<Post> {
  const res = await fetch(`${BASE}/posts?slug=${encodeURIComponent(slug)}`)
  if (!res.ok) throw new Error('Post not found')
  const posts: Post[] = await res.json()
  if (!posts[0]) throw new Error('Post not found')
  return posts[0]
}
export async function createPost(data: Omit<Post, 'id'>): Promise<Post> {
  const res = await fetch(`${BASE}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id: crypto.randomUUID() }) })
  if (!res.ok) throw new Error('Failed to create post')
  return res.json()
}
export async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  const res = await fetch(`${BASE}/posts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to update post')
  return res.json()
}
export async function deletePost(id: string): Promise<void> {
  await fetch(`${BASE}/posts/${id}`, { method: 'DELETE' })
}

// ─── Jobs ────────────────────────────────────────────────────────────────────
export async function getJobs(): Promise<Job[]> {
  const res = await fetch(`${BASE}/jobs`)
  if (!res.ok) throw new Error('Failed to fetch jobs')
  return res.json()
}
export async function getJobById(id: string): Promise<Job> {
  const res = await fetch(`${BASE}/jobs/${id}`)
  if (!res.ok) throw new Error('Job not found')
  return res.json()
}
export async function createJob(data: Omit<Job, 'id'>): Promise<Job> {
  const res = await fetch(`${BASE}/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id: crypto.randomUUID() }) })
  if (!res.ok) throw new Error('Failed to create job')
  return res.json()
}
export async function updateJob(id: string, data: Partial<Job>): Promise<Job> {
  const res = await fetch(`${BASE}/jobs/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to update job')
  return res.json()
}
export async function deleteJob(id: string): Promise<void> {
  await fetch(`${BASE}/jobs/${id}`, { method: 'DELETE' })
}

// ─── Contacts ────────────────────────────────────────────────────────────────
export async function getContacts(): Promise<Contact[]> {
  const res = await fetch(`${BASE}/contacts`)
  if (!res.ok) throw new Error('Failed to fetch contacts')
  return res.json()
}
export async function submitContact(data: Omit<Contact, 'id'>): Promise<void> {
  const res = await fetch(`${BASE}/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id: crypto.randomUUID() }) })
  if (!res.ok) throw new Error('Failed to submit contact')
}
export async function deleteContact(id: string): Promise<void> {
  await fetch(`${BASE}/contacts/${id}`, { method: 'DELETE' })
}

// ─── Job Applications ─────────────────────────────────────────────────────────
export async function getApplications(): Promise<JobApplication[]> {
  const res = await fetch(`${BASE}/applications`)
  if (!res.ok) throw new Error('Failed to fetch applications')
  return res.json()
}
export async function submitApplication(data: Omit<JobApplication, 'id'>): Promise<void> {
  const res = await fetch(`${BASE}/applications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id: crypto.randomUUID() }) })
  if (!res.ok) throw new Error('Failed to submit application')
}
export async function updateApplication(id: string, data: Partial<JobApplication>): Promise<JobApplication> {
  const res = await fetch(`${BASE}/applications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to update application')
  return res.json()
}
export async function deleteApplication(id: string): Promise<void> {
  await fetch(`${BASE}/applications/${id}`, { method: 'DELETE' })
}

// ─── Team ────────────────────────────────────────────────────────────────────
export async function getTeam(): Promise<TeamMember[]> {
  const res = await fetch(`${BASE}/team`)
  if (!res.ok) throw new Error('Failed to fetch team')
  const data: TeamMember[] = await res.json()
  return data.sort((a, b) => a.order - b.order)
}
export async function createTeamMember(data: Omit<TeamMember, 'id'>): Promise<TeamMember> {
  const res = await fetch(`${BASE}/team`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id: crypto.randomUUID() }) })
  if (!res.ok) throw new Error('Failed to create team member')
  return res.json()
}
export async function updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember> {
  const res = await fetch(`${BASE}/team/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to update team member')
  return res.json()
}
export async function deleteTeamMember(id: string): Promise<void> {
  await fetch(`${BASE}/team/${id}`, { method: 'DELETE' })
}

// ─── Case Studies ─────────────────────────────────────────────────────────────
export async function getCaseStudies(): Promise<CaseStudy[]> {
  const res = await fetch(`${BASE}/caseStudies`)
  if (!res.ok) throw new Error('Failed to fetch case studies')
  return res.json()
}
export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy> {
  const res = await fetch(`${BASE}/caseStudies?slug=${encodeURIComponent(slug)}`)
  if (!res.ok) throw new Error('Not found')
  const items: CaseStudy[] = await res.json()
  if (!items[0]) throw new Error('Not found')
  return items[0]
}
export async function createCaseStudy(data: Omit<CaseStudy, 'id'>): Promise<CaseStudy> {
  const res = await fetch(`${BASE}/caseStudies`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id: crypto.randomUUID() }) })
  if (!res.ok) throw new Error('Failed to create case study')
  return res.json()
}
export async function updateCaseStudy(id: string, data: Partial<CaseStudy>): Promise<CaseStudy> {
  const res = await fetch(`${BASE}/caseStudies/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to update case study')
  return res.json()
}
export async function deleteCaseStudy(id: string): Promise<void> {
  await fetch(`${BASE}/caseStudies/${id}`, { method: 'DELETE' })
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
export async function subscribeNewsletter(email: string): Promise<void> {
  const res = await fetch(`${BASE}/newsletter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, id: crypto.randomUUID(), createdAt: new Date().toISOString() }) })
  if (!res.ok) throw new Error('Failed to subscribe to newsletter')
}
export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const res = await fetch(`${BASE}/newsletter`)
  if (!res.ok) throw new Error('Failed to fetch subscribers')
  return res.json()
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface PageView {
  id: string; path: string; referrer: string; browser: string;
  device: string; timestamp: string; date: string;
}
export interface AnalyticsEvent {
  id: string; name: string; data: Record<string, string>;
  timestamp: string; date: string;
}

export async function getPageViews(): Promise<PageView[]> {
  const res = await fetch(`${BASE}/pageviews`)
  if (!res.ok) throw new Error('Failed')
  return res.json()
}
export async function getEvents(): Promise<AnalyticsEvent[]> {
  const res = await fetch(`${BASE}/events`)
  if (!res.ok) throw new Error('Failed')
  return res.json()
}

// ─── File Upload ──────────────────────────────────────────────────────────────
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Upload failed')
  }
  const data = await res.json()
  return data.url as string
}
