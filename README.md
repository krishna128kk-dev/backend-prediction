=# Backend Prediction Assignment

## Objective
A basic backend service to support prediction posting and retrieval for a Backend Developer Intern assignment.

## Tech Stack
- Node.js
- Express.js
- MongoDB (or mock database)
- Postman (for API testing)

## API Endpoints

### 1. `POST /prediction`
- **Input**: 
  - `question` (string, required)
  - `category` (string, required)
  - `expiryTime` (ISO 8601 date string, required)
- **Output**: 
  - `predictionId` (string)
  - Success message

### 2. `GET /predictions`
- **Output**: List of all active (non-expired) predictions

## Testing
Use Postman or any REST client to test endpoints with proper input validation.

## How to Run

1. Install dependencies:

   ```bash
   npm install
