# CodeHive

A comprehensive coding platform built with modern web technologies, featuring problem solving, code execution, contests, and leaderboards.

## Features
- User authentication via GitHub and Google OAuth
- Problem repository with various topics and difficulties
- Real-time code editor with Monaco Editor
- Code execution engine for multiple languages
- Submission tracking and verdicts (AC, WA, TLE, etc.)
- Leaderboards and contests
- Responsive UI with Tailwind CSS

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Passport.js for authentication
- WebSockets for real-time features
- Redis for caching

### Frontend
- React with TypeScript
- Vite for build tool
- Tailwind CSS for styling
- Monaco Editor for code editing
- React Router for navigation

### Execution Engine
- Docker for isolated code execution

## Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Redis
- Docker

### Backend Setup
1. Navigate to backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in .env file (see .env.example)
4. Run database migrations (if any)
5. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Execution Engine
1. Navigate to execution-engine directory
2. Build Docker images as needed

## Usage
- Access the frontend at http://localhost:3000
- Backend API at http://localhost:5000

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## License
MIT License
