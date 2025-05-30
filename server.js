const express = require('express');
const { check, validationResult } = require('express-validator');
const { MongoClient } = require('mongodb');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// MongoDB setup
const mongoUrl = 'mongodb://127.0.0.1:27017';
const dbName = 'predictionDB';

let db;
let predictionsCollection;
let client; // For shutdown

// Connect to MongoDB
async function connectToMongo() {
  try {
    client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    predictionsCollection = db.collection('predictions');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

connectToMongo();

// Root route
app.get('/', (req, res) => {
  res.send('Backend Prediction API is running');
});

// POST /prediction — Create a new prediction
app.post('/prediction', [
  check('question').isString().notEmpty().withMessage('Question is required'),
  check('category').isString().notEmpty().withMessage('Category is required'),
  check('expiryTime')
    .isISO8601().withMessage('expiryTime must be a valid ISO date')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('expiryTime must be a future date');
      }
      return true;
    }),
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { question, category, expiryTime } = req.body;
  const predictionId = uuidv4();

  const newPrediction = {
    predictionId,
    question,
    category,
    expiryTime: new Date(expiryTime),
    createdAt: new Date(),
  };

  try {
    await predictionsCollection.insertOne(newPrediction);
    res.json({ predictionId, message: 'Prediction created successfully' });
  } catch (err) {
    console.error('Error saving prediction:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /predictions — Get all active (non-expired) predictions
app.get('/predictions', async (req, res) => {
  const now = new Date();

  try {
    const activePredictions = await predictionsCollection
      .find({ expiryTime: { $gt: now } })
      .toArray();

    res.json(activePredictions);
  } catch (err) {
    console.error('Error retrieving predictions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /prediction/:id — Get a single prediction by ID
app.get('/prediction/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const prediction = await predictionsCollection.findOne({ predictionId: id });

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json(prediction);
  } catch (err) {
    console.error('Error retrieving prediction:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /opinion — Submit an opinion on a prediction
app.post('/opinion', [
  check('predictionId').isString().notEmpty().withMessage('predictionId is required'),
  check('userId').isString().notEmpty().withMessage('userId is required'),
  check('opinion').isIn(['Yes', 'No']).withMessage('opinion must be "Yes" or "No"'),
  check('amount').isFloat({ gt: 0 }).withMessage('amount must be a positive number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { predictionId, userId, opinion, amount } = req.body;

  try {
    const prediction = await predictionsCollection.findOne({
      predictionId,
      expiryTime: { $gt: new Date() },
    });

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found or expired' });
    }

    const opinionId = uuidv4();
    const newOpinion = {
      opinionId,
      predictionId,
      userId,
      opinion,
      amount,
      createdAt: new Date(),
    };

    const opinionsCollection = db.collection('opinions');
    await opinionsCollection.insertOne(newOpinion);

    res.json({ opinionId, message: 'Opinion submitted successfully' });
  } catch (err) {
    console.error('Error saving opinion:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down...');
  try {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  process.exit(0);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
