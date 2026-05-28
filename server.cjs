require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const mongoose = require('mongoose')

const server = express()
const dbFile = path.join(__dirname, 'db.json')
let useLocalDb = process.env.NODE_ENV !== 'production' || !process.env.MONGODB_URI

server.use(cors())
server.use(express.json({ limit: '50mb' }))
server.use(express.static(path.join(__dirname, 'public')))
server.use(express.static(path.join(__dirname, 'dist')))

if (!useLocalDb && process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      useLocalDb = false
      console.log('Connected to MongoDB Atlas')
    })
    .catch(err => {
      useLocalDb = true
      console.error('MongoDB unavailable; using local db.json:', err.message)
    })
} else {
  console.log('Using local db.json')
}

const readLocalDb = () => {
  if (!fs.existsSync(dbFile)) return {}
  try {
    return JSON.parse(fs.readFileSync(dbFile, 'utf8'))
  } catch (err) {
    console.error('Failed to read db.json:', err.message)
    return {}
  }
}

const writeLocalDb = (data) => {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2) + '\n')
}

const getLocalCollection = (collection) => {
  const data = readLocalDb()
  if (!Array.isArray(data[collection])) data[collection] = []
  return { data, items: data[collection] }
}

const matchesQuery = (doc, query) => {
  return Object.entries(query).every(([key, value]) => {
    if (key.startsWith('_')) return true
    if (Array.isArray(value)) return value.includes(String(doc[key]))
    return String(doc[key]) === String(value)
  })
}

const shouldUseMongo = () => !useLocalDb && mongoose.connection.readyState === 1

// File upload
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

server.post('/api/upload', (req, res) => {
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
    console.log(`Uploaded: ${req.file.originalname} (${req.file.mimetype}) -> ${url}`)
    res.json({ url, filename: req.file.filename, size: req.file.size })
  })
})

server.delete('/api/upload', (req, res) => {
  const { filename } = req.body
  if (!filename || filename.includes('..')) return res.status(400).json({ error: 'Invalid filename' })
  const filePath = path.join(uploadsDir, filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  res.json({ ok: true })
})

// Email endpoint
server.post('/api/send-email', async (req, res) => {
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) {
    console.log('Contact form submission (no RESEND_API_KEY):', req.body)
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
      subject: `New enquiry: ${enquiryType || 'General'} - ${name}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>New enquiry via playswitchgames.com</h2>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        <p><strong>Type:</strong> ${enquiryType || '-'}</p>
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

// Dynamic REST API routes. Uses MongoDB when connected, otherwise db.json.
server.get('/api/:collection', async (req, res) => {
  try {
    if (shouldUseMongo()) {
      const data = await mongoose.connection.db.collection(req.params.collection).find(req.query).toArray()
      return res.json(data)
    }

    const { items } = getLocalCollection(req.params.collection)
    const data = Object.keys(req.query).length ? items.filter(item => matchesQuery(item, req.query)) : items
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

server.get('/api/:collection/:id', async (req, res) => {
  try {
    if (shouldUseMongo()) {
      const doc = await mongoose.connection.db.collection(req.params.collection).findOne({ id: req.params.id })
      if (!doc) return res.status(404).json({ error: 'Not found' })
      return res.json(doc)
    }

    const { items } = getLocalCollection(req.params.collection)
    const doc = items.find(item => item.id === req.params.id)
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json(doc)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

server.post('/api/:collection', async (req, res) => {
  try {
    const newDoc = { ...req.body, id: req.body.id || Date.now().toString() }

    if (shouldUseMongo()) {
      await mongoose.connection.db.collection(req.params.collection).insertOne(newDoc)
      return res.status(201).json(newDoc)
    }

    const { data, items } = getLocalCollection(req.params.collection)
    items.push(newDoc)
    writeLocalDb(data)
    res.status(201).json(newDoc)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const updateDoc = async (req, res) => {
  try {
    if (shouldUseMongo()) {
      const result = await mongoose.connection.db.collection(req.params.collection).findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { returnDocument: 'after' }
      )
      if (!result) return res.status(404).json({ error: 'Not found' })
      return res.json(result)
    }

    const { data, items } = getLocalCollection(req.params.collection)
    const index = items.findIndex(item => item.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Not found' })
    items[index] = { ...items[index], ...req.body, id: req.params.id }
    writeLocalDb(data)
    res.json(items[index])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

server.put('/api/:collection/:id', updateDoc)
server.patch('/api/:collection/:id', updateDoc)

server.delete('/api/:collection/:id', async (req, res) => {
  try {
    if (shouldUseMongo()) {
      await mongoose.connection.db.collection(req.params.collection).deleteOne({ id: req.params.id })
      return res.json({ ok: true })
    }

    const { data, items } = getLocalCollection(req.params.collection)
    data[req.params.collection] = items.filter(item => item.id !== req.params.id)
    writeLocalDb(data)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Catch-all for React Router
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
  console.log(`\nSwitch API -> http://localhost:${PORT}`)
  console.log(`Uploads    -> http://localhost:${PORT}/uploads`)
  console.log(`Email      -> ${process.env.RESEND_API_KEY ? 'Resend enabled' : 'No RESEND_API_KEY set'}`)
})
