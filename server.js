const express = require('express');
const { check, validationResult } = require('express-validator');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

app.use(express.json());

// MongoDB connection URL and DB name
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'predictionDB';

let db;
let predictionsCollection;

// Connect to MongoDB once at server start
async function connectToMongo() {
  const client = new MongoClient(url);
  await client.connect();
  console.log('Connected to MongoDB');
  db = client.db(dbName);
  predictionsCollection = db.collection('predictions');
}

connectToMongo().catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

// ID generator
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Root test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// POST /prediction - Create a prediction
app.post('/prediction', [
  check('question').isString().notEmpty().withMessage('Question is required'),
  check('category').isString().notEmpty().withMessage('Category is required'),
  check('expiryTime').isISO8601().withMessage('expiryTime must be a valid ISO date'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { question, category, expiryTime } = req.body;
  const predictionId = generateId();

  try {
    const prediction = {
      predictionId,
      question,
      category,
      expiryTime: new Date(expiryTime),
      createdAt: new Date(),
    };

    await predictionsCollection.insertOne(prediction);

    res.json({ predictionId, message: 'Prediction created successfully' });
  } catch (err) {
    console.error('Error inserting prediction:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /predictions - List active predictions
app.get('/predictions', async (req, res) => {
  const now = new Date();
  try {
    const activePredictions = await predictionsCollection
      .find({ expiryTime: { $gt: now } })
      .toArray();

    res.json(activePredictions);
  } catch (err) {
    console.error('Error fetching predictions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
