# Farmer Registration Backend

A comprehensive multi-step farmer registration system built with Node.js, Express, and MongoDB.

## Features

- **Multi-step Registration**: Complete farmer profile with 5 steps of information
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Data Validation**: Comprehensive input validation and error handling
- **Protected Routes**: Middleware-based route protection
- **MongoDB Integration**: Mongoose ODM for database operations

## API Endpoints

### Authentication
- `POST /api/register` - Register a new farmer
- `POST /api/login` - User login
- `GET /api/profile` - Get current user profile (protected)
- `GET /api/users` - Get all users (protected)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Update the MongoDB URI in `.env` file
   - Change the JWT_SECRET to a secure secret key
   - Set up your MongoDB database

3. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Registration Data Structure

The registration system collects data in 5 steps:

1. **User Info**: Basic personal information
2. **Farm Info**: Farm details and location
3. **Crop Info**: Primary and secondary crops
4. **Equipment Info**: Farming equipment and IoT devices
5. **Pesticide Info**: Chemical usage and expenditure

## Security Features

- Password hashing with bcrypt (cost factor: 12)
- JWT tokens with 1-hour expiration
- Input validation and sanitization
- Protected routes with authentication middleware
- Error handling for duplicate registrations

## Usage Example

```javascript
// Register a new farmer
const response = await fetch('/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'securepassword',
    phone: '+1234567890',
    // ... other registration fields
  })
});

// Login
const loginResponse = await fetch('/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securepassword'
  })
});

// Access protected route
const usersResponse = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```