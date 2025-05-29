const express = require('express');
const { check, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory storage
const predictions = [];

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
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { question, category, expiryTime } = req.body;
  const predictionId = generateId();

  predictions.push({
    predictionId,
    question,
    category,
    expiryTime: new Date(expiryTime),
    createdAt: new Date(),
  });

  res.json({ predictionId, message: 'Prediction created successfully' });
});

// ✅ NEW: GET /predictions - List active predictions
app.get('/predictions', (req, res) => {
  const now = new Date();
  const activePredictions = predictions.filter(p => new Date(p.expiryTime) > now);
  res.json(activePredictions);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
