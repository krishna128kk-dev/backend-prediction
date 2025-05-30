# Backend Prediction Assignment

## Overview
This is a backend service built with **Node.js** and **Express** that allows users to post predictions, retrieve active predictions, and submit opinions on predictions. MongoDB is used as the database.

This project was developed as part of a Backend Developer Intern assignment.

## Features

- **POST /prediction**: Create a new prediction with question, category, and expiry time.  
- **GET /predictions**: Retrieve a list of all active (non-expired) predictions.  
- **POST /opinion***: Submit an opinion on a prediction with user ID, opinion ("Yes"/"No"), and amount.

## Technologies Used

- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- Postman (for API testing)

## Setup & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/krishna128kk-dev/backend-prediction.git
   cd backend-prediction
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure MongoDB is running locally or update your MongoDB URI in `server.js`.

4. Start the server:
   ```bash
   node server.js
   ```

5. Server runs at `http://localhost:3000`

## API Endpoints

### POST /prediction
Create a new prediction.

- Request body:
  ```json
  {
    "question": "Will AI take over coding by 2030?",
    "category": "Technology",
    "expiryTime": "2030-12-31T23:59:59Z"
  }
  ```
- Response:
  ```json
  {
    "predictionId": "unique-id",
    "message": "Prediction created successfully"
  }
  ```

### GET /predictions
Get all active (non-expired) predictions.

- Response: Array of prediction objects.

### POST /opinion (Optional)
Submit an opinion on a prediction.

- Request body:
  ```json
  {
    "predictionId": "prediction-id",
    "userId": "user123",
    "opinion": "Yes",
    "amount": 100
  }
  ```
- Response:
  ```json
  {
    "message": "Opinion submitted successfully",
    "opinionId": "unique-opinion-id"
  }
  ```

## Testing
Test endpoints using Postman or any REST API client.

## Notes
- Input validation is implemented for required fields.
- Only active (non-expired) predictions are returned.
- Opinions endpoint is optional and can be expanded with persistent storage.

---

Thank you for reviewing my assignment!
