# FTPlayer Backend

Express.js + TypeScript + MongoDB/Mongoose backend API for FTPlayer Android application.

## Setup

### Prerequisites

-   Node.js (v18+)
-   pnpm
-   MongoDB

### Installation

```bash
pnpm install
```

### Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
MONGODB_URI=mongodb://localhost:27017/ftplayer
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
PORT=5000
```

## Development

Start the development server with hot reload:

```bash
pnpm run dev
```

## Build

Build TypeScript to JavaScript:

```bash
pnpm run build
```

## Production

Start the production server:

```bash
pnpm run start
```

## API Endpoints

### Authentication

-   `POST /api/auth/signup` - Register a new user
-   `POST /api/auth/login` - Login user
-   `GET /api/auth/me` - Get current user info (requires authentication)

### Request/Response Examples

#### Sign Up

```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-12-14T10:00:00Z"
  }
}
```

#### Login

```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-12-14T10:00:00Z"
  }
}
```

#### Get Current User

```
GET /api/auth/me
Headers: Authorization: Bearer jwt_token_here

Response:
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-12-14T10:00:00Z",
    "updatedAt": "2024-12-14T10:00:00Z"
  }
}
```

## Project Structure

```
src/
├── config/           Database configuration
├── controllers/      Request handlers
├── middlewares/      Custom middlewares
├── models/          Mongoose schemas
├── routes/          API routes
└── index.ts         Application entry point
```

## Security Features

-   Password hashing with bcryptjs
-   JWT-based authentication
-   Input validation
-   Email uniqueness validation
