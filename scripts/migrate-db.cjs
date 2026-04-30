require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env')
  process.exit(1)
}

async function migrate() {
  try {
    console.log('Connecting to MongoDB Atlas...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB.')

    const dbPath = path.join(__dirname, '..', 'db.json')
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))

    const collections = Object.keys(data)
    console.log(`Found ${collections.length} collections to migrate:`, collections)

    for (const collectionName of collections) {
      console.log(`\nMigrating collection: ${collectionName}...`)
      const items = data[collectionName]
      
      if (!Array.isArray(items)) {
        console.log(`Skipping ${collectionName} - not an array.`)
        continue
      }

      // Convert "id" to string to maintain consistency if json-server used string IDs
      const formattedItems = items.map(item => ({
        ...item,
        id: String(item.id)
      }))

      const collection = mongoose.connection.collection(collectionName)
      
      // Clear existing data to avoid duplicates on re-run
      await collection.deleteMany({})
      
      if (formattedItems.length > 0) {
        await collection.insertMany(formattedItems)
        console.log(`Inserted ${formattedItems.length} items into ${collectionName}.`)
      } else {
        console.log(`No items to insert for ${collectionName}.`)
      }
    }

    console.log('\nMigration completed successfully! 🎉')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()
