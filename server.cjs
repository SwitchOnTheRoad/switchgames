require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const mongoose = require('mongoose')

const server = express()

server.use(cors())
server.use(express.json({ limit: '50mb' }))
server.use(express.static(path.join(__dirname, 'public')))
server.use(express.static(path.join(__dirname, 'dist')))

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err))

// ── File upload ──────────────────────────────────────────────────────────────
// Must be defined before server.use(middlewares) so json-server middleware
// doesn't interfere with the multipart/form-data stream.
const uploadsDir = path.join(__dirname, 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = Date.now() + '-' + Math.random().toString(36).slice(2) + ext
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
})

server.post('/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err.code, err.message)
      return res.status(400).json({ error: `Upload error: ${err.message}` })
    }
    if (err) {
      console.error('Upload error:', err.message)
      return res.status(400).json({ error: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file received' })
    }
    const url = `/uploads/${req.file.filename}`
    console.log(`📁 Uploaded: ${req.file.originalname} (${req.file.mimetype}) → ${url}`)
    res.json({ url, filename: req.file.filename, size: req.file.size })
  })
})

server.delete('/upload', (req, res) => {
  const { filename } = req.body
  if (!filename || filename.includes('..')) return res.status(400).json({ error: 'Invalid filename' })
  const filePath = path.join(uploadsDir, filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  res.json({ ok: true })
})

// middlewares are already replaced by express.static

// ── Email endpoint ────────────────────────────────────────────────────────────
server.post('/send-email', async (req, res) => {
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) {
    console.log('📧 Contact form submission (no RESEND_API_KEY):', req.body)
    return res.json({ ok: true, note: 'Set RESEND_API_KEY in .env to receive emails' })
  }
  try {
    const { Resend } = require('resend')
    const resend = new Resend(RESEND_KEY)
    const { name, email, company, enquiryType, message } = req.body
    await resend.emails.send({
      from: 'Switch <noreply@playswitchgames.com>',
      to: ['hello@playswitchgames.com'],
      replyTo: email,
      subject: `New enquiry: ${enquiryType || 'General'} — ${name}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>New enquiry via playswitchgames.com</h2>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        <p><strong>Type:</strong> ${enquiryType || '—'}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
        <p style="white-space:pre-wrap">${message}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
        <p style="color:#888;font-size:12px">Reply to this email to respond to ${name}</p>
      </div>`,
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// ── MongoDB Dynamic REST API Routes ──────────────────────────────────────────
const getCollection = (name) => mongoose.connection.collection(name)

server.get('/:collection', async (req, res) => {
  try {
    const data = await getCollection(req.params.collection).find({}).toArray()
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

server.get('/:collection/:id', async (req, res) => {
  try {
    const doc = await getCollection(req.params.collection).findOne({ id: req.params.id })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json(doc)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

server.post('/:collection', async (req, res) => {
  try {
    const newDoc = { ...req.body, id: Date.now().toString() }
    await getCollection(req.params.collection).insertOne(newDoc)
    res.status(201).json(newDoc)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

server.put('/:collection/:id', async (req, res) => {
  try {
    const result = await getCollection(req.params.collection).findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { returnDocument: 'after' }
    )
    if (!result) return res.status(404).json({ error: 'Not found' })
    res.json(result)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

server.delete('/:collection/:id', async (req, res) => {
  try {
    await getCollection(req.params.collection).deleteOne({ id: req.params.id })
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Catch-all for React Router ───────────────────────────────────────────────
server.get('*', (req, res) => {
  const distHtml = path.join(__dirname, 'dist', 'index.html')
  if (fs.existsSync(distHtml)) {
    res.sendFile(distHtml)
  } else {
    res.status(404).send('Frontend not built. Run npm run build.')
  }
})

const PORT = process.env.PORT || 3001
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎮 Switch API  →  http://localhost:${PORT}`)
  console.log(`📁 Uploads     →  http://localhost:${PORT}/uploads`)
  console.log(`📧 Email: ${process.env.RESEND_API_KEY ? 'Resend ✓' : 'No key — add RESEND_API_KEY to .env'}`)
})
