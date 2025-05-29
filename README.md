# Backend Prediction Assignment

##  Objective
A basic backend service to support prediction posting and retrieval for a Backend Developer Intern assignment.

##  Tech Stack
- Node.js
- Express.js
- MongoDB (or Firebase / mock DB)
- Postman (for testing)

## Endpoints

### 1. `POST /prediction`
- **Input**: `question`, `category`, `expiryTime`
- **Output**: `predictionId`, success message

### 2. `GET /predictions`
- **Output**: List of active predictions

### 3. (Optional) `POST /opinion`
- **Input**: `predictionId`, `userId`, `opinion` ("Yes"/"No"), `amount`

##  Testing
Use Postman to test each endpoint with proper input validation.

##  How to Run

1. Install dependencies:
   ```bash
   npm 