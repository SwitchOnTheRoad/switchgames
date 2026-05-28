require('dotenv').config()
const mongoose = require('mongoose')

let dbPromise = null;
const getDb = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection.db;
  if (!dbPromise) {
    dbPromise = mongoose.connect(process.env.MONGODB_URI).then(() => mongoose.connection.db);
  }
  return dbPromise;
}

async function test() {
  try {
    const promises = [
      getDb().then(db => db.collection('games').find({}).toArray()),
      getDb().then(db => db.collection('posts').find({}).toArray()),
      getDb().then(db => db.collection('team').find({}).toArray()),
    ]
    const results = await Promise.all(promises)
    console.log('Success!', results.map(r => r.length))
  } catch(e) {
    console.error('Error:', e)
  }
  process.exit(0)
}
test()
